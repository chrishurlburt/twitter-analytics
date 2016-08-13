const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.sendfile('views/index.html');
});

module.exports = router;
