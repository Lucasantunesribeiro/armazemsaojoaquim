import * as React from 'react';

interface AdminNotificationProps {
  nome: string;
  email: string;
  telefone: string;
  data: string;
  horario: string;
  pessoas: number;
  observacoes?: string;
  reservationId: string;
}

export const AdminNotification: React.FC<Readonly<AdminNotificationProps>> = ({
  nome,
  email,
  telefone,
  data,
  horario,
  pessoas,
  observacoes,
  reservationId,
}) => {
  const formattedDate = new Date(data).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#dc3545', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        <h1 style={{ margin: '0', fontSize: '24px' }}>🔔 Nova Reserva Confirmada</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: '0.9' }}>
          Armazém São Joaquim - Sistema de Reservas
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '30px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '8px', 
          padding: '15px', 
          margin: '0 0 25px 0' 
        }}>
          <p style={{ margin: '0', fontSize: '16px', color: '#155724', fontWeight: 'bold' }}>
            ✅ Uma nova reserva foi confirmada pelo cliente!
          </p>
        </div>

        {/* Customer Information */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #e9ecef', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <h3 style={{ color: '#dc3545', marginTop: '0' }}>👤 Dados do Cliente</h3>
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>Nome Completo:</strong> {nome}
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>E-mail:</strong> 
              <a href={`mailto:${email}`} style={{ color: '#007bff', marginLeft: '5px' }}>
                {email}
              </a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Telefone:</strong> 
              <a href={`tel:${telefone}`} style={{ color: '#007bff', marginLeft: '5px' }}>
                {telefone}
              </a>
            </li>
          </ul>
        </div>

        {/* Reservation Details */}
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <h3 style={{ color: '#856404', marginTop: '0' }}>📅 Detalhes da Reserva</h3>
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>📅 Data:</strong> {formattedDate}
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>🕐 Horário:</strong> {horario}
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>👥 Número de Pessoas:</strong> {pessoas} {pessoas === 1 ? 'pessoa' : 'pessoas'}
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>🆔 ID da Reserva:</strong> {reservationId}
            </li>
            {observacoes && (
              <li style={{ marginBottom: '10px' }}>
                <strong>📝 Observações:</strong> {observacoes}
              </li>
            )}
          </ul>
        </div>

        {/* Action Required */}
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          border: '1px solid #bee5eb', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <h3 style={{ color: '#0c5460', marginTop: '0' }}>📋 Próximos Passos</h3>
          <ul style={{ color: '#0c5460', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              Verificar disponibilidade da mesa para a data/horário solicitado
            </li>
            <li style={{ marginBottom: '8px' }}>
              Entrar em contato com o cliente se necessário
            </li>
            <li style={{ marginBottom: '8px' }}>
              Preparar a mesa conforme o número de pessoas
            </li>
            <li style={{ marginBottom: '8px' }}>
              Anotar observações especiais na agenda do restaurante
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <p style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
            Ações Rápidas:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={`mailto:${email}?subject=Confirmação de Reserva - Armazém São Joaquim&body=Olá ${nome},%0D%0A%0D%0ASua reserva foi confirmada!%0D%0AData: ${formattedDate}%0D%0AHorário: ${horario}%0D%0APessoas: ${pessoas}`}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                display: 'inline-block',
                margin: '5px'
              }}
            >
              📧 Responder por Email
            </a>
            <a 
              href={`https://wa.me/5521994099166?text=Olá! Sobre sua reserva para ${formattedDate} às ${horario}...`}
              style={{
                backgroundColor: '#25d366',
                color: 'white',
                padding: '10px 20px',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                display: 'inline-block',
                margin: '5px'
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#666' 
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>Sistema de Reservas - Armazém São Joaquim</strong><br/>
          Este email foi enviado automaticamente quando o cliente confirmou a reserva.
        </p>
        <p style={{ margin: '0' }}>
          Data/Hora do envio: {new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    </div>
  );
}; 