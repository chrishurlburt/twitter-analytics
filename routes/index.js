const express = require('express')
const createConnection = require('../middleware/connection')
const stream = require('../lib/stream.js')
const io = require('socket.io')()

const router = express.Router();

router
  .get('/', (req, res) => {
    res.sendfile('client/index.html');
  })
  .post('/', createConnection, (req, res) => {

    if (req.body.term) stream.open(io, req.body.term) // TODO: on disconnect, stop stream

    res.sendStatus(200)

  });

module.exports = router;
