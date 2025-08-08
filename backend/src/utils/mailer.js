const nodemailer = require('nodemailer');

function createTransporter() {
  if ((process.env.EMAIL_SERVICE || '').toLowerCase() === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail({ to, subject, text, html, from }) {
  try {
    // Check if required environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('[MAILER] Missing email configuration:', {
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
        EMAIL_SERVICE: process.env.EMAIL_SERVICE
      });
      throw new Error('Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS in your .env file.');
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: from || process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log('[MAILER] Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('[MAILER] Failed to send email:', error.message);
    throw error;
  }
}

module.exports = { sendEmail };


