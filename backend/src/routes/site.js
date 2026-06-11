const express = require('express');
const { getPublicSiteContent } = require('../site-content');

const router = express.Router();

router.get('/site', async (req, res) => {
  try {
    const content = await getPublicSiteContent(req);
    res.set('Cache-Control', 'public, max-age=60');
    return res.json(content);
  } catch (error) {
    console.error('Public site content failed:', error);
    return res.status(500).json({ error: 'Unable to load site content.' });
  }
});

module.exports = router;
