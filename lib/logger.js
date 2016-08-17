const env = require('dotenv').config()
const r = require('rethinkdbdash')({
  port: env.DATABASE_PORT,
  host: env.DATABASE_HOST,
  db: env.DATABASE_NAME
})

function Logger() {
  this.logTweet = logTweet
}

function logTweet(string, tweet, score) {

  r.table('tweets').insert({
    keyword: string,
    score: score,
    tweet: tweet
  })
  .run((response) => { return response })
  .error((err) => { return false })

}

module.exports = Logger;
