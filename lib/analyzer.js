const salient = require('salient')

function analyze (string) {

  return new Promise((resolve, reject) => {

    analyzeString(string, (result) => {

      if (result || typeof result != null) {
        resolve(result)
      } else {
        reject(Error('No result'))
      }

    })

  })

}

function analyzeString(string, callback) {

  let analyzer = new salient.sentiment.BayesSentimentAnalyser()
  let result = analyzer.classify(string)

  callback(result)

}

module.exports = {
  tweet: analyze
}
