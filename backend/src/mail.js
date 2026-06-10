const nodemailer = require('nodemailer');

const notifyEmail = process.env.NOTIFY_EMAIL || 'sirivruddhi@gmail.com';
const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
const resendFrom =
  process.env.RESEND_FROM || 'Siri Vruddhi <onboarding@resend.dev>';

const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s/g, '');
const smtpHost = (process.env.SMTP_HOST || '').trim();
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const smtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

const resendConfigured = Boolean(resendApiKey);
const emailConfigured = resendConfigured || smtpConfigured;
const emailProvider = resendConfigured ? 'resend' : smtpConfigured ? 'smtp' : null;

let transporter;

function buildInquiryContent(inquiry) {
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

  return {
    subject: `New inquiry: ${eventType} — ${name}`,
    text,
    html,
    replyTo: email,
  };
}

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
    configured: emailConfigured,
    provider: emailProvider,
    notifyEmail,
    resendFrom: resendConfigured ? resendFrom : null,
    smtpHost: smtpConfigured ? smtpHost : null,
    smtpUser: smtpConfigured ? smtpUser : null,
    note: resendConfigured
      ? 'Using Resend API (HTTPS) — works on Render'
      : smtpConfigured
        ? 'Using SMTP — may not work on Render (ports 587/465 blocked)'
        : 'Set RESEND_API_KEY on Render',
  };
}

async function verifyResend() {
  const response = await fetch('https://api.resend.com/domains', {
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
    },
  });

  if (response.ok) {
    return { ok: true, provider: 'resend' };
  }

  const body = await response.json().catch(() => ({}));
  const message = body.message || `Resend API error (${response.status})`;

  // Send-only keys cannot list domains but can still send inquiry emails.
  if (/restricted to only send emails/i.test(message)) {
    return {
      ok: true,
      provider: 'resend',
      sendOnlyKey: true,
      note: 'Send-only API key — email sending is enabled',
    };
  }

  return {
    ok: false,
    provider: 'resend',
    error: message,
  };
}

async function verifyMailConnection() {
  if (resendConfigured) {
    return verifyResend();
  }

  const transport = getTransporter();
  if (!transport) {
    return {
      ok: false,
      error: 'Email not configured. Set RESEND_API_KEY on Render (SMTP is blocked there).',
    };
  }

  try {
    await transport.verify();
    return { ok: true, provider: 'smtp' };
  } catch (error) {
    return { ok: false, provider: 'smtp', error: error.message };
  }
}

async function sendViaResend(inquiry, content) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [notifyEmail],
      reply_to: content.replyTo,
      subject: content.subject,
      html: content.html,
      text: content.text,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Resend send failed (${response.status})`);
  }

  return body.id;
}

async function sendViaSmtp(inquiry, content) {
  const transport = getTransporter();
  if (!transport) {
    return null;
  }

  const info = await transport.sendMail({
    from: {
      name: 'Siri Vruddhi Website',
      address: smtpUser,
    },
    to: notifyEmail,
    replyTo: content.replyTo,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  return info.messageId;
}

async function sendInquiryNotification(inquiry) {
  if (!emailConfigured) {
    console.warn('Email not configured — inquiry saved but no email sent.');
    return false;
  }

  const content = buildInquiryContent(inquiry);

  if (resendConfigured) {
    const messageId = await sendViaResend(inquiry, content);
    console.log(`Inquiry email sent via Resend for #${inquiry.id} → ${notifyEmail} (${messageId})`);
    return true;
  }

  const messageId = await sendViaSmtp(inquiry, content);
  console.log(`Inquiry email sent via SMTP for #${inquiry.id} → ${notifyEmail} (${messageId})`);
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
