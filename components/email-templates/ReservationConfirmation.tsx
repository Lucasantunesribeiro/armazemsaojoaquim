import * as React from 'react';

interface ReservationConfirmationProps {
  nome: string;
  data: string;
  horario: string;
  pessoas: number;
  observacoes?: string;
  confirmationToken: string;
  siteUrl: string;
}

export const ReservationConfirmation: React.FC<Readonly<ReservationConfirmationProps>> = ({
  nome,
  data,
  horario,
  pessoas,
  observacoes,
  confirmationToken,
  siteUrl,
}) => {
  const confirmationUrl = `${siteUrl}/api/reservas/confirm?token=${confirmationToken}`;
  const formattedDate = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });

  return (
    <div style={{ 
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
      maxWidth: '650px', 
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    }}>
      {/* Header com gradiente */}
      <div style={{ 
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)', 
        padding: '40px 30px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Decoração de fundo */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.05"%3E%3Cpath d="m0 40 40-40h-40v40zm40 0v-40h-40l40 40z"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: '0.3'
        }} />
        
        <div style={{ position: 'relative', zIndex: '1' }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '32px', 
            color: 'white',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏺 Armazém São Joaquim
          </h1>
          <p style={{ 
            margin: '0', 
            fontSize: '16px', 
            color: 'rgba(255,255,255,0.9)',
            fontStyle: 'italic',
            fontWeight: '300'
          }}>
            "En esta casa tenemos memoria"
          </p>
          <div style={{
            width: '60px',
            height: '3px',
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            margin: '20px auto 0',
            borderRadius: '2px'
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 30px' }}>
        {/* Saudação */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#8B4513', 
            marginBottom: '15px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            Olá, {nome}! 👋
          </h2>
          
          <p style={{ 
            fontSize: '18px', 
            lineHeight: '1.7', 
            color: '#4a5568',
            margin: '0',
            fontWeight: '400'
          }}>
            Que alegria receber sua solicitação de reserva! 🎉<br/>
            Estamos ansiosos para recebê-lo em nosso ambiente acolhedor.
          </p>
        </div>

        {/* Card de detalhes da reserva */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', 
          border: '2px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '30px', 
          margin: '30px 0',
          position: 'relative'
        }}>
          {/* Ícone decorativo */}
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '30px',
            backgroundColor: '#8B4513',
            color: 'white',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            📋
          </div>

          <h3 style={{ 
            color: '#8B4513', 
            marginTop: '10px',
            marginBottom: '25px',
            fontSize: '22px',
            fontWeight: '600'
          }}>
            Detalhes da sua Reserva
          </h3>

          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ 
              backgroundColor: 'white',
              padding: '15px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid #FFD700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <span style={{ 
                fontSize: '16px',
                color: '#2d3748',
                fontWeight: '600'
              }}>
                📅 Data: <span style={{ color: '#8B4513', fontWeight: '700' }}>{formattedDate}</span>
              </span>
            </div>

            <div style={{ 
              backgroundColor: 'white',
              padding: '15px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid #FF6B35',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <span style={{ 
                fontSize: '16px',
                color: '#2d3748',
                fontWeight: '600'
              }}>
                🕐 Horário: <span style={{ color: '#8B4513', fontWeight: '700' }}>{horario}</span>
              </span>
            </div>

            <div style={{ 
              backgroundColor: 'white',
              padding: '15px 20px',
              borderRadius: '12px',
              borderLeft: '4px solid #38A169',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <span style={{ 
                fontSize: '16px',
                color: '#2d3748',
                fontWeight: '600'
              }}>
                👥 Pessoas: <span style={{ color: '#8B4513', fontWeight: '700' }}>{pessoas} {pessoas === 1 ? 'pessoa' : 'pessoas'}</span>
              </span>
            </div>

            {observacoes && (
              <div style={{ 
                backgroundColor: 'white',
                padding: '15px 20px',
                borderRadius: '12px',
                borderLeft: '4px solid #9F7AEA',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <span style={{ 
                  fontSize: '16px',
                  color: '#2d3748',
                  fontWeight: '600'
                }}>
                  📝 Observações: <span style={{ color: '#8B4513', fontWeight: '700' }}>{observacoes}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botão de confirmação */}
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <a 
            href={confirmationUrl}
            style={{
              background: 'linear-gradient(135deg, #48BB78 0%, #38A169 50%, #2F855A 100%)',
              color: 'white',
              padding: '18px 40px',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: '700',
              display: 'inline-block',
              boxShadow: '0 10px 25px rgba(72, 187, 120, 0.3)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            ✅ Confirmar Minha Reserva
          </a>
        </div>

        {/* Aviso importante */}
        <div style={{ 
          background: 'linear-gradient(135deg, #FEF5E7 0%, #FAE5C3 100%)', 
          border: '2px solid #F6AD55', 
          borderRadius: '16px', 
          padding: '25px',
          margin: '30px 0',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '25px',
            backgroundColor: '#F6AD55',
            color: 'white',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>
            ⚠️
          </div>

          <p style={{ 
            margin: '10px 0 0 0', 
            fontSize: '16px', 
            color: '#744210',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            <strong>Importante:</strong> Sua reserva está com status <em>"pendente"</em> até que você 
            clique no botão de confirmação acima. Após confirmar, nosso restaurante será notificado 
            automaticamente e você receberá um email de confirmação final.
          </p>
        </div>

        {/* Link alternativo */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#718096', 
            lineHeight: '1.6',
            margin: '0 0 10px 0'
          }}>
            Problemas para clicar no botão? Copie e cole este link no seu navegador:
          </p>
          <a href={confirmationUrl} style={{ 
            color: '#3182ce', 
            wordBreak: 'break-all',
            fontSize: '13px',
            textDecoration: 'underline'
          }}>
            {confirmationUrl}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)', 
        padding: '30px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ 
            margin: '0 0 15px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#FFD700'
          }}>
            🏺 Armazém São Joaquim
          </h4>
          <p style={{ 
            margin: '0 0 10px 0',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            Rua Almirante Alexandrino, 470 - Santa Teresa<br/>
            Rio de Janeiro - RJ
          </p>
        </div>
        
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            📞 (21) 99409-9166
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            📧 armazemsaojoaquimoficial@gmail.com
          </div>
        </div>
        
        <p style={{ 
          margin: '20px 0 0 0', 
          fontSize: '12px', 
          color: 'rgba(255,255,255,0.6)',
          fontStyle: 'italic'
        }}>
          Desde 1854 • 170 anos de tradição gastronômica
        </p>
      </div>
    </div>
  );
}; 