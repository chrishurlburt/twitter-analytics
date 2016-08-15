const salient = require('salient')

function analyze (string) {
  return new Promise((resolve, reject) => {
    analyzeString(string, (result) => {
      if (result) {
        resolve(result)
      } else {
        reject(string)
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
