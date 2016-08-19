const env = require('dotenv').config()
const r = require('rethinkdb')

// @TODO: compensate in changefeed queries for beginning and end of hours
// @TODO: custom interval
// @TODO: seperate averaging in its own module
// @TODO: docblocks
// @TODO: optimize calcAverage to only query for scores

function Stats() {
  this.average = average;
}

function average(keyword, interval, callback) {

  subscribeToInterval(keyword, interval)
  subscribeToAveragePool(callback)

}

// Subscribe to interval
function subscribeToInterval(keyword, interval) {

  // subscribe to interval
  r.table('tweets')
    .filter({keyword: keyword})
    .filter((tweet) => {
      return tweet('timestamp')
        .date()
        .eq(r.now().date())
        // greater than the current time's minutes minus x minutes
        .and(tweet('timestamp').minutes().gt(r.now().minutes().sub(5)))
    })
    .changes({includeInitial: true})
    .run(global.db, (err, cursor) => {
      cursor.each((err, row) => {
        if (err) throw err
        addToPool(row)
      })
    })

    // subscribe to inverse of the interval
    r.table('tweets')
      .filter({keyword: keyword})
      .filter((tweet) => {
        return tweet('timestamp')
          .date()
          .eq(r.now().date())
          // less than the current time's minutes minus x minutes
          .and(tweet('timestamp').minutes().lt(r.now().minutes().sub(5)))
      })
      .changes({includeInitial: true})
      .run(global.db, (err, cursor) => {
        cursor.each((err, row) => {
          if (err) throw err
          removeFromPool(row)
        })
      })
}

// subscribe to any changes from the average pool
function subscribeToAveragePool(callback) {

  r.table('average_pool')
    .changes()
    .run(global.db, (err, cursor) => {
      cursor.each((err, row) => {
        if (err) throw err
          calcAverage(row, callback)
      })
    })
}

function calcAverage(row, callback) {
  // retrieve table, calculate average
  let sum = 0
  let count = 0
  r.table('average_pool')
    // .withFields('new_val.score')
    .run(global.db, (err, cursor) => {
      if (err) throw err
      cursor.each((err, row) => {
        if (err) throw err
        sum += row.new_val.score
        count += 1
      }, () => {
        callback(sum / count)
      })
    })
}

// add an item to the average pool
function addToPool(item) {
  r.table('average_pool')
    .insert(item)
    .run(global.db)
}

// remove and item from the average pool
function removeFromPool(item) {
  r.table('average_pool')
    .filter((tweet) => {
      return tweet('new_val.id').eq(item.new_val.id)
    })
    .delete()
    .run(global.db)
}


module.exports = Stats
