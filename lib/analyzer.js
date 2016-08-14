const sentiment = require('sentiment')

function analyze (string) {

  return new Promise((resolve, reject) => {

    sentiment(string, (string, results) => {
        // the string arg is totally pointless and evaluates to null...
        // for some reason, second arg is what gets the results in
        // this callback

        if (results.score || typeof results.score != null) {
          let score = results.score

          if (results.score > 10) score = 10
          if (results.score < -10) score = -10

          resolve(score * .1)

        } else {
          reject(Error('no score could be calcuated for string'))
        }

    })

  })

}

module.exports = {
  tweet: analyze
}
