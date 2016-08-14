const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.sendfile('client/index.html');
});

module.exports = router;
