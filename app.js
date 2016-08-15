const env = require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const twitter = require('./lib/twitter')
const analyzer = require('./lib/analyzer')
const io = require('socket.io')()

const routes = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

app.set('view engine', 'jade');

app.use('/', routes);

// Setup socket server
io.listen(3001);

// Set keyword
twitter.track('olympics')

// Real-time sentiment analysis
io.on('connection', (socket) => {
  twitter.on('tweet', (tweet) => {
    analyzer.tweet(tweet.text).then((score) => {
      // getting lots of 0's, likely because of retweets...
      // need to compensate for this somehow. ignoring them for now
      if (score != 0) io.emit('score', {
        tweet: tweet.text,
        score: score
      })
    }).catch((err) => {
      console.log(err)
    })
  })
})


twitter.on('error', function (err) {
  console.log('error')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
