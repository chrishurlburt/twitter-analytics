const twitter = require('./twitter')
const analyzer = require('./analyzer')
const Stats = require('./stats')
const Logger = require('./logger')

const logger = new Logger()
const stats = new Stats()

function stream(io, string) {
  io.listen(3001)
  io.on('connection', (socket) => {
    twitter.stream('statuses/filter', {track: string, language: 'en'}, (stream) => {

      stats.setAverageSentimentInterval(10000, (average) => {
        io.emit('average_min', average)
      })

      stream.on('data', (tweet) => {
        analyzer.tweet(tweet.text).then((score) => {
          let data = {
            tweet: tweet.text,
            score: score
          }
          io.emit('score', data)
          stats.pushStack(score)
          logger.logTweet(string, tweet, score)

        }).catch((string) => {
          // no sentiment could be calculated
        })
      })
    })
  })
}

module.exports = {
  open: stream
}
