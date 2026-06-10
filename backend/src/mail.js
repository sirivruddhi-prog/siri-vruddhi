const nodemailer = require('nodemailer');

const notifyEmail = process.env.NOTIFY_EMAIL || 'sirivruddhi@gmail.com';
const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s/g, '');
const smtpHost = (process.env.SMTP_HOST || '').trim();
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

const smtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

let transporter;

function getTransporter() {
  if (!smtpConfigured) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      requireTLS: !smtpSecure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return transporter;
}

function getMailStatus() {
  return {
    configured: smtpConfigured,
    notifyEmail,
    smtpHost: smtpHost || null,
    smtpUser: smtpUser || null,
  };
}

async function verifyMailConnection() {
  const transport = getTransporter();
  if (!transport) {
    return { ok: false, error: 'SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS on Render)' };
  }

  try {
    await transport.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
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

  const info = await transport.sendMail({
    from: {
      name: 'Siri Vruddhi Website',
      address: smtpUser,
    },
    to: notifyEmail,
    replyTo: email,
    subject: `New inquiry: ${eventType} — ${name}`,
    text,
    html,
  });

  console.log(`Inquiry email sent for #${id} → ${notifyEmail} (${info.messageId})`);
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
  getMailStatus,
  verifyMailConnection,
};
