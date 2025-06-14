#!/usr/bin/env node

const { Resend } = require('resend');

// Configuração do Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Função para enviar email
async function sendEmail(to, subject, content, from = 'armazemsaojoaquim@gmail.com') {
  try {
    const data = await resend.emails.send({
      from: from,
      to: [to],
      subject: subject,
      html: content,
    });

    console.log('Email enviado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

// Processamento dos argumentos da linha de comando
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Uso: node email-server.js <to> <subject> <content> [from]');
    process.exit(1);
  }

  const [to, subject, content, from] = args;
  
  const result = await sendEmail(to, subject, content, from);
  
  if (result.success) {
    console.log('✅ Email enviado com sucesso!');
    process.exit(0);
  } else {
    console.error('❌ Falha ao enviar email:', result.error);
    process.exit(1);
  }
}

// Exportar funções para uso em outros módulos
module.exports = {
  sendEmail,
  resend
};

// Executar se chamado diretamente
if (require.main === module) {
  main();
} 