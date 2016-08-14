const sentiment = require('sentiment')

function analyze (string) {

  return new Promise((resolve, reject) => {

    sentiment(string, (err, results) => {

        if (results.score || typeof results.score != null) {
          let score = results.score

          if (results.score > 10) score = 10
          if (results.score < -10) score = -10

          resolve(score * .1)

        } else {
          reject(err)
        }

    })

  })

}

module.exports = {
  tweet: analyze
}
