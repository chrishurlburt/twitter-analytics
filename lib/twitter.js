const env = require('dotenv').config()
const Twitter = require('twitter');

const t = new Twitter({
  consumer_key: env.TWITTER_CONSUMER_KEY,
  consumer_secret: env.TWITTER_CONSUMER_SECRET,
  access_token_key: env.TWITTER_TOKEN,
  access_token_secret: env.TWITTER_TOKEN_SECRET,
})

module.exports = t;
