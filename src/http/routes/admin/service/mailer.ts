import nodemailer from 'nodemailer';
import { env } from '../../../../env/env';

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: env.EMAIL_USER, 
      pass: env.EMAIL_PASSWORD, 
    },
  });
};

export const sendInviteEmail = async (email: string, token: string) => {
  const transporter = createTransporter();

  const inviteLink = `https://chamaBurger.com/aceitar-convite?token=${token}`;

  const mailOptions = {
    from: env.EMAIL_USER, 
    to: email, 
    subject: 'Convite para se juntar à nossa plataforma', 
    text: `Você foi convidado para se juntar à nossa plataforma. Para aceitar o convite, clique no link abaixo:\n\n${inviteLink}`, 
  };

  try {
    await transporter.sendMail(mailOptions); 
    console.log(`Convite enviado para ${email}`);
  } catch (error) {
    console.error(`Erro ao enviar o convite para ${email}:`, error);
  }
};
