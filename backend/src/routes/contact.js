const express = require('express');
const pool = require('../db');
const { sendInquiryNotification } = require('../mail');

const router = express.Router();

router.post('/inquiries', async (req, res) => {
  const { name, email, phone, eventType, message } = req.body;

  if (!name || !email || !phone || !eventType) {
    return res.status(400).json({ error: 'Please provide name, email, phone, and event type.' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO inquiries (name, email, phone, event_type, message) VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, eventType, message || '']
    );

    const inquiry = {
      id: result.insertId,
      name,
      email,
      phone,
      eventType,
      message: message || '',
    };

    res.status(201).json({ id: inquiry.id, message: 'Inquiry received successfully.' });

    sendInquiryNotification(inquiry).catch((mailError) => {
      console.error('Inquiry email failed:', mailError.message);
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Unable to save inquiry. Please try again later.' });
  }
});

module.exports = router;
