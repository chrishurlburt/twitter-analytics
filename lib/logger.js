const env = require('dotenv').config()
const r = require('rethinkdb')

function Logger() {
  this.logTweet = logTweet
}

function logTweet(string, tweet, score) {

  r.table('tweets').insert({
    keyword: string,
    score: score,
    timestamp: Date.now(),
    tweet: tweet.text
  })
  .run(global.db)
}

module.exports = Logger;
