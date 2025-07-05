# Templates de Email para EmailJS

## Configuração necessária no Dashboard do EmailJS

### 1. Template para Cliente (template_6z7ja2t)

**Assunto:** Confirme sua reserva - Armazém São Joaquim

**Conteúdo HTML:**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme sua Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .btn { display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{restaurant_name}}</h1>
            <p>Confirme sua Reserva</p>
        </div>
        
        <div class="content">
            <h2>Olá, {{customer_name}}!</h2>
            <p>Recebemos sua solicitação de reserva. Para confirmar sua mesa, clique no botão abaixo:</p>
            
            <div class="details">
                <h3>Detalhes da Reserva:</h3>
                <p><strong>Data:</strong> {{reservation_date}}</p>
                <p><strong>Horário:</strong> {{reservation_time}}</p>
                <p><strong>Pessoas:</strong> {{guest_count}}</p>
                <p><strong>Observações:</strong> {{special_requests}}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{confirmation_link}}" class="btn">CONFIRMAR RESERVA</a>
            </div>
            
            <p><strong>Importante:</strong> Sua reserva só será válida após a confirmação. Clique no link acima para garantir sua mesa.</p>
        </div>
        
        <div class="footer">
            <p><strong>{{restaurant_name}}</strong><br>
            {{restaurant_address}}<br>
            📞 {{restaurant_phone}} | 📧 {{to_email}}</p>
        </div>
    </div>
</body>
</html>
```

### 2. Template para Restaurante (template_pnnqpyf)

**Assunto:** Nova Reserva Confirmada - {{customer_name}}

**Conteúdo HTML:**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Reserva Confirmada</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .details { background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2; }
        .customer-info { background-color: #f1f8e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Nova Reserva Confirmada!</h1>
            <p>{{restaurant_name}}</p>
        </div>
        
        <div class="content">
            <h2>Reserva Confirmada por: {{customer_name}}</h2>
            <p>Uma nova reserva foi confirmada e precisa de sua atenção.</p>
            
            <div class="details">
                <h3>📅 Detalhes da Reserva:</h3>
                <p><strong>ID da Reserva:</strong> {{reservation_id}}</p>
                <p><strong>Data:</strong> {{reservation_date}}</p>
                <p><strong>Horário:</strong> {{reservation_time}}</p>
                <p><strong>Número de Pessoas:</strong> {{guest_count}}</p>
                <p><strong>Observações Especiais:</strong> {{special_requests}}</p>
                <p><strong>Confirmada em:</strong> {{created_at}}</p>
            </div>
            
            <div class="customer-info">
                <h3>👤 Informações do Cliente:</h3>
                <p><strong>Nome:</strong> {{customer_name}}</p>
                <p><strong>Email:</strong> {{customer_email}}</p>
                <p><strong>Telefone:</strong> {{customer_phone}}</p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h4 style="margin-top: 0; color: #856404;">🔔 Ações Necessárias:</h4>
                <ul style="color: #856404; margin-bottom: 0;">
                    <li>Verificar disponibilidade da mesa</li>
                    <li>Preparar arranjo especial se necessário</li>
                    <li>Confirmar com a equipe de atendimento</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Este email foi gerado automaticamente pelo sistema de reservas.<br>
            Para dúvidas, acesse o painel administrativo.</p>
        </div>
    </div>
</body>
</html>
```

## Variáveis Disponíveis

### Para Template do Cliente:
- `{{to_name}}` - Nome do cliente
- `{{to_email}}` - Email do cliente
- `{{customer_name}}` - Nome do cliente
- `{{customer_email}}` - Email do cliente
- `{{customer_phone}}` - Telefone do cliente
- `{{reservation_date}}` - Data da reserva formatada
- `{{reservation_time}}` - Horário da reserva
- `{{guest_count}}` - Número de pessoas
- `{{special_requests}}` - Observações especiais
- `{{confirmation_link}}` - Link para confirmação
- `{{restaurant_name}}` - Nome do restaurante
- `{{restaurant_address}}` - Endereço do restaurante
- `{{restaurant_phone}}` - Telefone do restaurante

### Para Template do Restaurante:
- `{{to_email}}` - Email do restaurante (armazemsaojoaquimoficial@gmail.com)
- `{{reservation_id}}` - ID da reserva
- `{{customer_name}}` - Nome do cliente
- `{{customer_email}}` - Email do cliente
- `{{customer_phone}}` - Telefone do cliente
- `{{reservation_date}}` - Data da reserva formatada
- `{{reservation_time}}` - Horário da reserva
- `{{guest_count}}` - Número de pessoas
- `{{special_requests}}` - Observações especiais
- `{{created_at}}` - Data/hora da confirmação
- `{{restaurant_name}}` - Nome do restaurante

## Configuração no EmailJS

1. Acesse [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Vá em "Email Templates"
3. Clique em "Create New Template"
4. Configure:
   - **Template ID:** template_6z7ja2t (para clientes)
   - **Template Name:** Confirmação de Reserva - Cliente
   - **Subject:** Confirme sua reserva - Armazém São Joaquim
   - **Content:** Cole o HTML do template do cliente

5. Repita para o template do restaurante:
   - **Template ID:** template_pnnqpyf (para restaurante)
   - **Template Name:** Notificação de Reserva - Restaurante
   - **Subject:** Nova Reserva Confirmada - {{customer_name}}
   - **Content:** Cole o HTML do template do restaurante

6. Salve ambos os templates

## Teste dos Templates

Para testar se os templates estão funcionando:

1. Crie uma reserva no sistema
2. Verifique se o email de confirmação chegou
3. Clique no link de confirmação
4. Verifique se o restaurante recebeu a notificação

## Personalização

Você pode personalizar:
- Cores do design (atualize o CSS)
- Logos e imagens (adicione URLs de imagens)
- Texto e mensagens
- Layout e estrutura

## Solução de Problemas

**Email não chega:**
- Verifique se o EmailJS está configurado corretamente
- Confirme se os template IDs estão corretos
- Verifique a caixa de spam

**Link de confirmação não funciona:**
- Verifique se a variável NEXT_PUBLIC_SITE_URL está configurada
- Teste o endpoint /api/reservas/confirm

**Restaurante não recebe notificação:**
- Verifique se o email armazemsaojoaquimoficial@gmail.com está correto
- Confirme se o template do restaurante está ativo 