const twitter = require('./twitter')
const analyzer = require('./analyzer.js')

function stream(io, string) {
  // Setup socket server
  io.listen(3001);
  // Set keyword
  twitter.track(string)
  // Real-time sentiment analysis
  io.on('connection', (socket) => {
    twitter.on('tweet', (tweet) => {
      analyzer.tweet(tweet.text).then((score) => {
        // getting lots of 0's, likely because of retweets...
        // need to compensate for this somehow. ignoring them for now
        if (score != 0) io.emit('score', {
          tweet: tweet.text,
          score: score
        })
      }).catch((err) => {
        console.log(err)
      })
    })
  })
}

module.exports = {
  open: stream
}
