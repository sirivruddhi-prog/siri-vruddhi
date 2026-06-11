const express = require('express');
const { getMedia } = require('../media');

const router = express.Router();

router.get('/media/:id/:filename', async (req, res) => {
  try {
    const asset = await getMedia(req.params.id);
    if (!asset) {
      return res.status(404).send('Image not found.');
    }

    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Content-Length', asset.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(asset.data);
  } catch (error) {
    console.error('Media serve failed:', error);
    return res.status(500).send('Unable to load image.');
  }
});

module.exports = router;
