function Stats() {
  this.averageSentiment = averageSentiment;
  this.pushStack = pushStack;
  this.clearStack = clearStack;
}

let stack = []

function averageSentiment() {
  return stack.reduce((p,c) => {
    return p + c
  }) / stack.length
}

function pushStack(int) {
  stack.push(int)
  return stack
}

function clearStack() {
  stack = [];
  return stack
}

module.exports = Stats
