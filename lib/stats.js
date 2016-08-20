const env = require('dotenv').config()
const r = require('rethinkdb')

// @TODO: seperate averaging in its own module
// @TODO: docblocks
// @TODO: custom intervals where average pools are created dynamically by keyword.
//        ex. average_keyword_interval -- addToPool, removeFromPool and calcAverage need logic

function Stats() {
  this.average = average;
}

function average(keyword, interval, callback) {

  let now = Date.now()
  let earlier = now - interval

  subscribeToInterval(keyword, earlier, interval)
  subscribeToAveragePool(keyword, callback)

}

// Subscribe to interval
function subscribeToInterval(keyword, earlier, interval) {

  r.table('tweets')
    .filter({keyword: keyword})
    .filter((doc) => {
      return doc('timestamp').gt(earlier)
    })
    .changes({includeInitial: true})
    .run(global.db, (err, cursor) => {
      cursor.each((err, row) => {
        if (err) throw err
        addToPool(row, interval)
      })
    })
}

// subscribe to any changes from the average pool
function subscribeToAveragePool(keyword, callback) {

  r.table('average_pool')
    .changes()
    .run(global.db, (err, cursor) => {
      cursor.each((err, row) => {
        if (err) throw err
          calcAverage(row, keyword, callback)
      })
    })
}

function calcAverage(row, keyword, callback) {
  // retrieve table, calculate average
  let sum = 0
  let count = 0
  r.table('average_pool')
    .filter({new_val: {keyword: keyword }})
    .pluck({new_val: ['score']})
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
function addToPool(item, interval) {
  console.log('add')
  r.table('average_pool')
    .insert(item)
    .run(global.db)

    // get time right now
    let now = Date.now()
    // calculate how long this item has already existed in the db
    let existed = now - item.new_val.timestamp
    // set time to live accordingly
    let ttl = interval - existed

    setTimeout(removeFromPool, ttl, item)

}

// remove an item from the average pool
function removeFromPool(item) {
  console.log('remove')
  r.table('average_pool')
    .filter({new_val: {id: item.new_val.id}})
    .delete({returnChanges: true})
    .run(global.db)
}

module.exports = Stats
