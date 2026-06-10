/**
 * Test SMTP from backend/.env — run: npm run test:email
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { verifyMailConnection, sendInquiryNotification } = require('../src/mail');

(async () => {
  console.log('Checking SMTP connection...');
  const verify = await verifyMailConnection();
  if (!verify.ok) {
    console.error('FAILED:', verify.error);
    process.exit(1);
  }
  console.log('SMTP connection OK. Sending test email...');

  await sendInquiryNotification({
    id: 0,
    name: 'SMTP Test',
    email: 'test@example.com',
    phone: '9999999999',
    eventType: 'Test',
    message: 'If you receive this, email notifications are working.',
  });

  console.log('Test email sent. Check your inbox.');
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
