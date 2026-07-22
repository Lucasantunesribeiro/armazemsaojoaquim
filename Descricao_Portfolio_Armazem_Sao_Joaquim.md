# Descrição de Portfólio - Armazém São Joaquim

> Auditoria baseada no repositório real, incluindo leitura de código, estrutura, migrations e execução de checks locais. Evidências objetivas: `npm run type-check` passou, `npm run build` passou, `npm test` não encontrou testes, `npm run lint` falhou por script incompatível/quebrado. O repositório contém 87 rotas de API, 45 migrations SQL e cerca de 20 endpoints de teste/debug/diagnóstico expostos na base.

# 1 Visão Geral do Projeto

O projeto é uma plataforma digital fullstack para o Armazém São Joaquim, combinando site institucional, cardápio online, blog, área de pousada, catálogo do café, galeria de arte e um painel administrativo para operação do negócio.

Na prática, ele resolve um problema real de presença digital e backoffice. Em vez de ser apenas uma landing page, o sistema tenta centralizar:

- exposição de produtos e conteúdo;
- autenticação de usuários;
- reservas;
- gestão administrativa de blog, cardápio, usuários e ativos;
- integrações de comunicação e analytics.

O domínio principal é hospitalidade e varejo de experiência: restaurante, pousada, café e conteúdo editorial, com um subdomínio administrativo relativamente amplo.

O ponto importante para portfólio é que não se trata de um CRUD acadêmico pequeno. É um sistema com escopo real de produto, múltiplos módulos e preocupação operacional. O contraponto é que o escopo cresceu mais rápido do que a disciplina arquitetural.

# 2 Arquitetura do Sistema

Arquiteturalmente, o sistema é um monólito modular serverless em cima de Next.js App Router com Supabase como backend-as-a-service. Não é microservices, não é event driven e não implementa Clean Architecture de forma formal.

Como isso aparece no código real:

- `app/[locale]` concentra as páginas públicas e administrativas, com internacionalização por segmento de rota.
- `app/api` concentra os endpoints serverless, inclusive rotas públicas, administrativas, de teste, diagnóstico e manutenção.
- `components` organiza UI em `admin`, `atoms`, `molecules`, `sections`, `ui`, sugerindo uma inspiração em Atomic Design.
- `lib` concentra autenticação, acesso ao Supabase, cache, retry, monitoramento, validações e utilitários.
- `supabase/migrations` concentra a evolução de banco, RLS, funções SQL e correções de segurança.

Padrões efetivamente presentes:

- modularização por feature;
- backend serverless via route handlers;
- uso intensivo de Supabase Auth + PostgreSQL + RLS;
- middleware para locale e proteção de área admin;
- tipagem TypeScript gerada/manual para o banco.

Padrões ausentes ou apenas superficiais:

- Clean Architecture: ausente. As rotas falam diretamente com Supabase e carregam regra de negócio nelas mesmas.
- DDD: ausente. Não há camada de domínio, aggregates, entities ricas, value objects ou bounded contexts explícitos.
- CQRS: ausente formalmente.
- Event Driven: ausente.

Há ainda um problema de drift arquitetural: convivem implementações antigas e novas para o mesmo domínio. Exemplos claros:

- `app/api/admin/blog/route.ts` usa contrato antigo de blog (`title`, `slug`, `featured_image_url`), enquanto `app/api/admin/blog/posts/route.ts` usa o modelo multilíngue (`title_pt`, `title_en`, `slug_pt`, `slug_en`).
- `app/api/reservas/*.ts` usa a tabela `reservations`, enquanto `lib/api.ts`, hooks e dashboard usam `reservas`.
- parte do código ainda consome `users`, embora migrations posteriores removam a `view public.users` por risco de segurança.

Conclusão arquitetural: o projeto é melhor classificado como um monólito modular de produto real com forte acoplamento entre UI, API e infraestrutura Supabase. É funcional e grande, mas não demonstra arquitetura enterprise clássica.

# 3 Stack Tecnológica

## Backend

- Next.js 16 com App Router e Route Handlers.
  Motivo: unifica frontend e backend serverless em uma base só e acelera entrega.
- TypeScript.
  Motivo: tipagem estática e maior segurança de refatoração.
- Supabase JS / Supabase SSR.
  Motivo: autenticação, acesso ao PostgreSQL, cookies de sessão e integração rápida com ambiente serverless.
- Zod.
  Motivo: validação de payloads em formulários e algumas rotas.

## Frontend

- React 19.
  Motivo: UI declarativa e ecossistema moderno do Next.
- Tailwind CSS.
  Motivo: velocidade de construção visual e padronização de estilos.
- Radix UI e shadcn/ui.
  Motivo: base de componentes acessíveis e reaproveitáveis.
- React Hook Form.
  Motivo: formulários complexos no auth e no admin.

## Banco de Dados

- PostgreSQL via Supabase.
  Motivo: persistência relacional para reservas, perfis, blog, cardápio, café, pousada e logs.
- SQL migrations no diretório `supabase/migrations`.
  Motivo: versionamento de schema, RLS, funções e correções operacionais.
- RPC/functions SQL.
  Motivo: encapsular parte da lógica administrativa e de segurança no banco.

## Infraestrutura

- Netlify.
  Motivo: deploy simples do Next.js em modo serverless.
- Service Worker em `public/sw.js`.
  Motivo: capacidades de PWA/cache offline.

## DevOps

- `npm` scripts para build, testes, diagnósticos e operações.
  Observação crítica: 44 scripts apontam para `scripts/`, mas o diretório não existe no repositório atual.
- `netlify.toml`.
  Motivo: build, runtime e headers de segurança/cache.

## Mensageria

- Não há RabbitMQ, Kafka, SQS, SNS ou fila equivalente.
  Impacto: o projeto não demonstra comunicação assíncrona enterprise.

## Observabilidade

- Google Analytics via `components/Analytics.tsx`.
- endpoint interno `/api/analytics`.
- health checks em `/api/health*` e `/api/admin/health-check`.
- tentativas de audit log e auth log com tabelas/migrations específicas.

Motivo: medir tráfego, coletar métricas e dar suporte operacional básico. Na prática, a observabilidade é parcial e não centralizada.

# 4 Fluxo do Sistema

Fluxo principal mais representativo hoje:

1. O visitante acessa páginas públicas em `app/[locale]`, com conteúdo estático e conteúdo dinâmico vindo do Supabase.
2. O usuário pode se autenticar via Supabase Auth na tela `app/[locale]/auth/page.tsx`.
3. Ao criar uma reserva, o frontend chama `/api/reservas`.
4. A rota valida dados, grava no banco e gera token de confirmação.
5. O usuário confirma a reserva via `/api/reservas/confirm?token=...`.
6. O painel administrativo consome `/api/admin/*` para listar e editar blog, cardápio, usuários, reservas, café, pousada e galeria.
7. O banco PostgreSQL, protegido por RLS em várias tabelas, sustenta os módulos operacionais.

Fluxo de administração:

1. O usuário loga.
2. `middleware.ts` e `app/[locale]/admin/layout.tsx` tentam validar acesso admin.
3. Em vários pontos, a verificação aceita diretamente o email `armazemsaojoaquimoficial@gmail.com` como admin.
4. As rotas administrativas frequentemente usam `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS.
5. Alterações são persistidas diretamente em tabelas do Supabase.

Esse fluxo funciona, mas mostra um padrão importante: o sistema depende mais de verificação procedural e de service role do que de uma camada de autorização realmente coesa.

# 5 Conceitos de Engenharia Aplicados

- SOLID: parcial.
  Há utilitários reutilizáveis em `lib/`, separação razoável de responsabilidades em alguns módulos e reuso de hooks/componentes. Porém, várias rotas concentram autenticação, validação, acesso a banco e resposta HTTP no mesmo arquivo.

- DDD: ausente.
  Não existe camada de domínio explícita, linguagem ubíqua formalizada, aggregates ou modelagem rica de regras de negócio.

- Clean Architecture: ausente.
  UI, API e infraestrutura estão fortemente acopladas. Os handlers acessam Supabase diretamente, sem application services ou repositories estáveis.

- CQRS: ausente formalmente.
  Há separação prática entre rotas públicas e administrativas, mas não existe modelo de command/query nem segregação arquitetural.

- Event Driven: ausente.
  O sistema é request/response. Não há broker, publisher, consumer ou workflow assíncrono.

- Outbox Pattern: ausente.
  Nenhuma implementação encontrada.

- Idempotência: fraca/parcial.
  A confirmação de reserva por token reduz duplicidade em um fluxo específico, mas não há idempotency keys nem desenho explícito de reprocessamento seguro.

- Retry: parcial.
  Existe `lib/retry-handler.ts` com backoff e wrappers para fetch/Supabase. Isso é positivo, mas restrito a chamadas locais.

- DLQ: ausente.
  Não há filas nem dead-letter queue.

- Auditoria: parcial.
  Há `lib/audit-logger.ts`, `lib/auth/logging.ts` e migrations para `auth_logs` e `admin_sessions`, mas o uso é inconsistente e parte do código ainda cai em `console.log` como fallback.

# 6 Relevância Para o Mercado Brasileiro

## O projeto demonstra skills demandadas?

Parcialmente, sim.

Ele demonstra:

- React/Next.js em escala razoável;
- APIs REST/serverless;
- PostgreSQL;
- autenticação;
- painel administrativo;
- migrations;
- deploy;
- noções de segurança com RLS.

Ele não demonstra:

- C#;
- .NET;
- ASP.NET Core;
- EF Core;
- AWS;
- mensageria enterprise;
- Redis;
- CI/CD maduro;
- testes automatizados reais.

## Ele parece um projeto enterprise?

Em escopo, sim.

Em execução técnica, ainda não.

O projeto tem cara de produto real e ambição grande, mas a implementação atual é mais próxima de um sistema fullstack TypeScript com patches acumulados do que de uma solução enterprise madura. Ele tem volume, módulos e preocupação operacional, porém ainda sem governança arquitetural suficiente.

## Ele é relevante para vagas Junior?

Sim, especialmente para:

- Fullstack JavaScript/TypeScript;
- Frontend React/Next.js;
- vagas que valorizam produto real e painel administrativo.

Para vagas `.NET` no Brasil, a relevância é indireta. Ele ajuda a mostrar raciocínio de produto, web, banco e segurança, mas não serve como prova direta da stack alvo do candidato.

Se o objetivo for estágio/júnior `.NET`, este projeto deve ser tratado como um bom projeto fullstack complementar, não como o projeto âncora definitivo da candidatura.

# 7 Como Explicar o Projeto em Entrevista

## Explicação simples (30 segundos)

Desenvolvi uma plataforma fullstack para o Armazém São Joaquim, unificando site institucional, cardápio, blog, reservas e um painel administrativo. O projeto usa Next.js, TypeScript e Supabase com PostgreSQL e autenticação, e foi pensado para atender um negócio real, não apenas um CRUD de estudo.

## Explicação técnica (2 minutos)

O sistema é um monólito modular serverless construído com Next.js App Router. A interface pública e administrativa fica em `app/[locale]`, e o backend foi implementado com route handlers em `app/api`. Para dados e autenticação, usei Supabase, com PostgreSQL, RLS e várias migrations para perfis, blog multilíngue, cardápio, reservas, café e pousada.

Do ponto de vista técnico, o projeto mostra modularização por feature, middleware de locale e proteção da área admin, tipagem TypeScript e algum cuidado com retry, cache, health checks e auditoria. Ao mesmo tempo, a auditoria mostrou limitações importantes: a arquitetura não é Clean Architecture nem DDD, há drift entre schema e código em alguns módulos, a autorização admin depende bastante de fallback por email, e a base ainda não possui testes automatizados reais nem CI/CD. Então eu explicaria o projeto como um produto fullstack real com boa complexidade funcional, mas ainda em evolução em termos de maturidade de engenharia.

# 8 Pontos Fortes do Projeto

- Escopo real de negócio, muito acima de projeto tutorial.
- Painel administrativo amplo, cobrindo múltiplos módulos operacionais.
- Internacionalização por rota (`pt` e `en`).
- Uso de PostgreSQL com migrations e RLS.
- Build de produção funcionando em Next.js 16.
- `type-check` passando, o que indica integridade básica da base.
- Organização modular por feature e boa quantidade de componentes reutilizáveis.
- Deploy preparado para Netlify com headers e cache.
- Uso de autenticação e sessão em cenário real.
- Presença de health checks, analytics e logs, ainda que parciais.

# 9 Pontos a Melhorar

- O projeto não usa `.NET`, `C#`, `ASP.NET Core` ou `EF Core`, o que reduz fortemente a aderência ao alvo principal do candidato.
- A arquitetura não implementa Clean Architecture nem DDD; a lógica está acoplada a handlers e ao Supabase.
- Existem inconsistências graves entre código, tipos e schema.
  Exemplo: `app/api/reservas/route.ts` usa `reservations`, enquanto `types/database.types.ts`, `lib/api.ts` e dashboard usam `reservas`.
- Existem contratos antigos e novos convivendo no mesmo domínio.
  Exemplo: `app/api/admin/blog/route.ts` usa campos antigos do blog, enquanto `app/api/admin/blog/posts/route.ts` usa o modelo multilíngue novo.
- A autorização admin é frágil e fortemente baseada em email hardcoded.
  Isso aparece em `middleware.ts`, `lib/admin-auth.ts`, `lib/auth/admin-verification.ts` e `app/[locale]/admin/layout.tsx`.
- Há endpoints sensíveis de teste, correção e bypass expostos no código de produção.
  Exemplos: `/api/auth/fix-database`, `/api/auth/signup-bypass`, `/api/test-login`, `/api/admin/test-rls`, `/api/admin/debug-database`.
- Não há testes automatizados reais.
  `npm test` retorna zero testes.
- O lint não está operacional.
  `npm run lint` falha no estado atual.
- Não há CI/CD versionado no repositório.
  Não existe `.github/` nem pipeline equivalente.
- Não há Docker nem ambiente local reproduzível por contêiner.
- Não há mensageria, processamento assíncrono robusto ou integração cloud enterprise.
- Observabilidade é parcial.
  O endpoint `/api/analytics` hoje só faz log em console e o email ainda é híbrido/mock em partes do sistema.
- Há sinais de acúmulo de remendos operacionais.
  O `package.json` referencia 44 scripts em `scripts/`, mas o diretório não existe.
- O README está desatualizado em relação à stack real.
  Ele menciona Next 15/React 18, enquanto o projeto hoje está em Next 16/React 19.
- O build já acusa dívida técnica.
  Há warnings de depreciação do `middleware` e de `experimental.middlewarePrefetch`.

# 10 Melhorias Prioritárias Para Portfólio

1. Introduzir um backend em ASP.NET Core 8 para os domínios principais.
   Isso é o maior ganho de empregabilidade para o alvo `.NET`. O frontend atual pode continuar em Next/React, mas o candidato passaria a demonstrar `C#`, `ASP.NET Core`, DTOs, services, repositories, validação e autenticação em uma stack muito mais alinhada ao mercado brasileiro.

2. Criar testes automatizados reais.
   Começar por unit tests de regras críticas, integration tests de APIs e alguns fluxos E2E. Para recrutadores técnicos, isso muda a percepção de “projeto grande” para “projeto confiável”.

3. Remover ou proteger endpoints de teste, debug, bypass e correção operacional.
   Isso melhora muito a imagem de segurança e maturidade. Um painel admin com endpoints como `signup-bypass` e `fix-database` abertos em build de produção derruba a confiança arquitetural.

4. Corrigir o drift entre schema, migrations, tipos e rotas.
   Unificar `reservas` x `reservations`, remover contratos antigos de blog e alinhar `types/database.types.ts` com todas as tabelas realmente usadas.

5. Adicionar Docker e pipeline de CI/CD.
   Docker, checks de lint/test/build e deploy automatizado aumentam muito a aderência a vagas júnior/pleno no Brasil.

6. Substituir o modelo de admin por RBAC real.
   Em vez de depender de um email hardcoded, usar papéis/claims e autorização consistente. Isso melhora segurança e demonstra engenharia backend mais séria.

7. Evoluir observabilidade.
   Centralizar logs estruturados, métricas, tracing e dashboards. Em um portfólio enterprise-like, isso gera bastante diferencial.

8. Adicionar mensageria e processamento assíncrono.
   Mesmo que seja em um recorte pequeno, usar RabbitMQ ou SQS para confirmação de reserva, envio de email ou processamento de eventos aproxima o projeto do mercado `.NET` enterprise.

9. Padronizar documentação técnica.
   README, arquitetura, setup, threat model e runbook alinhados ao estado real do código aumentam muito o valor do projeto no GitHub.

10. Levar a infraestrutura para AWS.
    Mesmo que o frontend siga no Netlify, migrar backend/filas/observabilidade para AWS daria aderência direta ao foco de carreira informado.

# 11 Como Colocar no Currículo

Plataforma fullstack para gestão digital e backoffice do Armazém São Joaquim, construída com Next.js, TypeScript e Supabase, incluindo autenticação, PostgreSQL com migrations e RLS, painel administrativo, blog multilíngue, cardápio online e fluxo de reservas.

# 12 Nível do Projeto

Classificação: **Junior+**

Motivo:

- o escopo funcional é grande e mostra entrega real;
- a base tem volume, múltiplos módulos e preocupações além de UI;
- porém a maturidade arquitetural ainda não sustenta classificação pleno ou enterprise-like;
- faltam testes, CI/CD, governança de segurança, consistência de domínio e aderência direta à stack `.NET`.

É um projeto acima da média para júnior em termos de ambição e produto, mas ainda não é um case enterprise-like.

# 13 Checklist de Mercado

| REQUISITO MERCADO | PRESENTE NO PROJETO | OBSERVAÇÃO |
|---|---|---|
| C# | Não | Não há código C# no repositório |
| .NET / ASP.NET Core | Não | Backend é Next.js Route Handlers |
| EF Core | Não | Acesso a dados é via Supabase client |
| PostgreSQL | Sim | Via Supabase |
| SQL / Migrations | Sim | 45 migrations SQL versionadas |
| APIs REST | Sim | 87 rotas em `app/api` |
| React | Sim | Frontend principal |
| Next.js | Sim | Base central do sistema |
| TypeScript | Sim | Base fortemente tipada |
| Docker | Não | Não há `Dockerfile` nem `docker-compose` |
| CI/CD | Não | Não há pipeline versionado |
| AWS | Não | Deploy atual é Netlify + Supabase |
| Azure | Não | Não encontrado |
| RabbitMQ / Kafka / SQS | Não | Sem mensageria |
| Redis | Não | Só cache em memória local |
| Supabase Auth | Sim | Fluxo central de autenticação |
| RLS | Sim | Presente em várias migrations |
| Testes automatizados | Não | `npm test` não encontra testes |
| Lint operacional | Parcial | Script existe, mas está quebrado |
| Observabilidade | Parcial | Analytics, health checks e logs, mas sem stack robusta |
| Clean Architecture | Não | Forte acoplamento entre rota e infraestrutura |
| DDD | Não | Sem camada de domínio explícita |
| CQRS | Não | Não formalizado |
| Event Driven | Não | Fluxo síncrono request/response |
| PWA / Service Worker | Sim | `public/sw.js` |
| Internacionalização | Sim | Rotas `pt` e `en` |
| Painel administrativo | Sim | Módulo admin amplo |
| Segurança básica | Parcial | Headers, auth e RLS existem, mas há bypasses e rotas perigosas |

# 14 Score Final do Projeto

**Nota final: 6,5 / 10**

Justificativa:

- a nota sobe porque o projeto tem escopo real, volume de código, painel administrativo, banco relacional, autenticação, migrations e build funcionando;
- a nota cai porque a engenharia ainda é inconsistente em pontos críticos: ausência de testes, lint quebrado, drift entre schema e código, duplicação de rotas/contratos, exposição de endpoints sensíveis e modelo frágil de autorização;
- para vagas `.NET`, a nota efetiva de aderência é menor do que a nota geral do projeto, porque falta a stack-alvo do candidato.

Em resumo: é um projeto forte como evidência de entrega fullstack e produto real, mas ainda não é o projeto definitivo para vender um perfil `Backend .NET` ou `Fullstack .NET + React`. Com uma evolução dirigida para ASP.NET Core, testes, segurança e AWS, ele pode se transformar em um case muito mais competitivo.
