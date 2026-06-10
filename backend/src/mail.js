const nodemailer = require('nodemailer');

const notifyEmail = process.env.NOTIFY_EMAIL || 'sirivruddhi@gmail.com';
const smtpConfigured =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter;

function getTransporter() {
  if (!smtpConfigured) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

async function sendInquiryNotification(inquiry) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('SMTP not configured — inquiry saved but no email sent.');
    return false;
  }

  const { id, name, email, phone, eventType, message } = inquiry;
  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });

  const text = [
    'New inquiry from sirivruddhi.com',
    '',
    `Reference ID: ${id}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Event type: ${eventType}`,
    `Message: ${message || '(none)'}`,
    '',
    `Submitted: ${submittedAt} (IST)`,
  ].join('\n');

  const html = `
    <h2>New inquiry — Siri Vruddhi</h2>
    <p><strong>Reference ID:</strong> ${id}</p>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td><strong>Phone</strong></td><td><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>
      <tr><td><strong>Event type</strong></td><td>${escapeHtml(eventType)}</td></tr>
      <tr><td><strong>Message</strong></td><td>${escapeHtml(message || '(none)')}</td></tr>
    </table>
    <p style="color:#666;margin-top:16px;">Submitted: ${submittedAt} (IST)</p>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM || `"Siri Vruddhi Website" <${process.env.SMTP_USER}>`,
    to: notifyEmail,
    replyTo: email,
    subject: `New inquiry: ${eventType} — ${name}`,
    text,
    html,
  });

  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  sendInquiryNotification,
};
