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
        backgroundColor: '#8B4513', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center' 
      }}>
        <h1 style={{ margin: '0', fontSize: '24px' }}>Armazém São Joaquim</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: '0.9' }}>
          "En esta casa tenemos memoria"
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '30px 20px', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>
          Olá, {nome}!
        </h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
          Recebemos sua solicitação de reserva no <strong>Armazém São Joaquim</strong>. 
          Para confirmar sua reserva, clique no botão abaixo:
        </p>

        {/* Reservation Details */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #e9ecef', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <h3 style={{ color: '#8B4513', marginTop: '0' }}>Detalhes da Reserva</h3>
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>📅 Data:</strong> {formattedDate}
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>🕐 Horário:</strong> {horario}
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>👥 Pessoas:</strong> {pessoas} {pessoas === 1 ? 'pessoa' : 'pessoas'}
            </li>
            {observacoes && (
              <li style={{ marginBottom: '10px' }}>
                <strong>📝 Observações:</strong> {observacoes}
              </li>
            )}
          </ul>
        </div>

        {/* Confirmation Button */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={confirmationUrl}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '15px 30px',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            ✅ CONFIRMAR RESERVA
          </a>
        </div>

        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '5px', 
          padding: '15px', 
          margin: '20px 0' 
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
            <strong>⚠️ Importante:</strong> Sua reserva estará com status "pendente" até que você 
            clique no botão de confirmação acima. Após a confirmação, você receberá um email 
            de confirmação final.
          </p>
        </div>

        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br/>
          <a href={confirmationUrl} style={{ color: '#007bff', wordBreak: 'break-all' }}>
            {confirmationUrl}
          </a>
        </p>
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
          <strong>Armazém São Joaquim</strong><br/>
          Rua Almirante Alexandrino, 470 - Santa Teresa, Rio de Janeiro - RJ
        </p>
        <p style={{ margin: '0' }}>
          📞 (21) 98565-8443 | 📧 armazemsaojoaquimoficial@gmail.com
        </p>
      </div>
    </div>
  );
}; 