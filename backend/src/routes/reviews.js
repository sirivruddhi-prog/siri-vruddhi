const express = require('express');
const { getSection } = require('../site-content');
const { getPublicReviews } = require('../google-reviews');

const router = express.Router();

router.get('/reviews', async (req, res) => {
  try {
    const row = await getSection('reviews');
    const payload = await getPublicReviews(row?.content || {});
    res.set('Cache-Control', 'public, max-age=300');
    return res.json(payload);
  } catch (error) {
    console.error('Public reviews failed:', error);
    return res.status(500).json({ error: 'Unable to load reviews.' });
  }
});

module.exports = router;
