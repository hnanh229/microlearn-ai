const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid
 * @param {Object} options - { to, subject, text, html }
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, text, html }) => {
  return sgMail.send({
    to,
    from: process.env.EMAIL_FROM, // Must be a verified sender in SendGrid
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
