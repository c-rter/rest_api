const express = require('express');

const emojis = require('./emojis');
const faqs = require('./faqs');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API2 - 👋🌎🌍🌏'
  });
});

router.use('/emojis', emojis);
router.use('/faqs', faqs);
module.exports = router;
