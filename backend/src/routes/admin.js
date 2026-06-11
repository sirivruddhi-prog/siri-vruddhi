const express = require('express');
const {
  isAdminConfigured,
  verifyPassword,
  signAdminToken,
  setAuthCookie,
  clearAuthCookie,
  requireAdmin,
} = require('../auth');
const {
  loginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
} = require('../middleware/loginRateLimit');
const {
  STATUSES,
  listInquiries,
  getInquiry,
  updateInquiry,
  listInquiriesForExport,
  toCsv,
} = require('../inquiries');

const router = express.Router();

router.post('/login', loginRateLimit, (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).json({ error: 'Admin login is not configured on the server.' });
  }

  const { password } = req.body || {};
  if (!verifyPassword(password)) {
    recordFailedLogin(req);
    return res.status(401).json({ error: 'Invalid password.' });
  }

  clearLoginAttempts(req);
  const token = signAdminToken();
  setAuthCookie(res, token);
  return res.json({ ok: true, email: process.env.ADMIN_EMAIL || 'sirivruddhi@gmail.com' });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  return res.json({
    ok: true,
    email: process.env.ADMIN_EMAIL || 'sirivruddhi@gmail.com',
  });
});

router.get('/inquiries/export.csv', requireAdmin, async (req, res) => {
  try {
    const rows = await listInquiriesForExport({
      status: req.query.status,
      eventType: req.query.eventType,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });
    const csv = toCsv(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inquiries.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('CSV export failed:', error);
    return res.status(500).json({ error: 'Unable to export inquiries.' });
  }
});

router.get('/inquiries', requireAdmin, async (req, res) => {
  try {
    const result = await listInquiries({
      status: req.query.status,
      eventType: req.query.eventType,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      page: req.query.page,
      limit: req.query.limit,
    });
    return res.json(result);
  } catch (error) {
    console.error('List inquiries failed:', error);
    return res.status(500).json({ error: 'Unable to load inquiries.' });
  }
});

router.get('/inquiries/:id', requireAdmin, async (req, res) => {
  try {
    const inquiry = await getInquiry(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    return res.json(inquiry);
  } catch (error) {
    console.error('Get inquiry failed:', error);
    return res.status(500).json({ error: 'Unable to load inquiry.' });
  }
});

router.patch('/inquiries/:id', requireAdmin, async (req, res) => {
  const { status, adminNotes } = req.body || {};

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  if (!status && adminNotes === undefined) {
    return res.status(400).json({ error: 'Provide status and/or adminNotes to update.' });
  }

  try {
    const inquiry = await updateInquiry(req.params.id, { status, adminNotes });
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    return res.json(inquiry);
  } catch (error) {
    console.error('Update inquiry failed:', error);
    return res.status(500).json({ error: 'Unable to update inquiry.' });
  }
});

module.exports = router;
