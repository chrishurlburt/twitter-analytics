function Stats() {
  this.averageSentiment = averageSentiment;
  this.averageSentimentInterval = averageSentimentInterval;
  this.pushStack = pushStack;
  this.clearStack = clearStack;
}

let stack = []
let intervalSet = false;

function averageSentiment() {
  return stack.reduce((p,c) => {
    return p + c
  }) / stack.length
}

function setAverageSentimentInterval(duration, callback) {
  if (intervalSet) throw new Error('Average sentiment interval is already set')
  setInterval(() => {
    callback(averageSentiment())
    clearStack()
  }, duration)
  intervalSet = true;
}

function pushStack(int) {

  if (!intervalSet) throw new Error('Average Sentiment interval must be set before data can be pushed to the stack.')

  stack.push(int)
  return stack
}

function clearStack() {
  stack = []
}

module.exports = Stats
