const twitter = require('./twitter')
const analyzer = require('./analyzer')
const Stats = require('./stats')

function stream(io, string) {
  // Listen for socket connection
  io.listen(3001)
  // Socket client connected
  io.on('connection', (socket) => {
    // Open stream to twitter
    twitter.stream('statuses/filter', {track: string, language: 'en'}, (stream) => {
      const stats = new Stats()
      // Listen for tweets
      stream.on('data', (tweet) => {
        // Analyze tweet for sentiment
        analyzer.tweet(tweet.text).then((score) => {
          // Push to client
          let data = {
            tweet: tweet.text,
            score: score
          }
          io.emit('score', data)
          stats.pushStack(score)
        }).catch((string) => {
          // no sentiment could be calculated
          // console.log(string)
        })
      })

      // Send average sentiment every minute
      setInterval(() => {
        io.emit('average_min', stats.averageSentiment())
        stats.clearStack();
      }, 60000)

    })
  })
}

module.exports = {
  open: stream
}
