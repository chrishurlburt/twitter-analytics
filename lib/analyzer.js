const sentiment = require('sentiment')

function analyze (string) {

  let score = sentiment(string).score

  if(score > 10) score = 10
  if(score < -10) score = -10

  if (score != 0) return score * .1

  return false

}

module.exports = {
  tweet: analyze
}
