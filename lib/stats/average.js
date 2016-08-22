const env = require('dotenv').config()
const r = require('rethinkdb')

// @TODO: set TTL on document so on initial query of average pool table, ttl's can be

/**
 * Calculate average sentiment in real time for a given time range.
 * @param  {string}   keyword   target keyword
 * @param  {int}      interval  average interval
 * @param  {Function} callback  called on recalculation of average
 * @return {null}
 */
function average(keyword, interval, callback) {
  let now = Date.now()
  let earlier = now - interval
  let table = 'average_'+keyword+'_'+interval

  initAveragePool(table, () => {
    subscribeToInterval(table, keyword, earlier, interval)
    subscribeToAveragePool(table, keyword, callback)
  })
}


/**
 * Create average pool table if it doesn't alrady exist for given keyword and interval.
 * @param  {string}   table     name of the table in average_keyword_interval format
 * @param  {Function} callback  called on creation of table
 * @return {null}
 */
function initAveragePool(table, callback) {
  r.tableList().contains(table)
  .do(function(tableExists) {
    return r.branch(tableExists,{ table_created: 0 },r.tableCreate(table));
  }).run(global.db, (err) => {
    if (err) throw err
    callback()
  })
}


/**
 * Subscribe to changefeed of interval
 * @param  {string} table    average pool table
 * @param  {string} keyword  target keyword
 * @param  {int} earlier     the current time - the interval
 * @param  {int} interval    average interval
 * @return {null}
 */
function subscribeToInterval(table, keyword, earlier, interval) {
  r.table('tweets')
    .filter({keyword: keyword})
    .filter((doc) => {
      return doc('timestamp').gt(earlier)
    })
    .changes({includeInitial: true})
    .run(global.db, (err, cursor) => {
      cursor.each((err, row) => {
        if (err) throw err
        addToPool(table, row, interval)
      })
    })
}


/**
 * Subscribe to changes in the average pool
 * @param  {string}   table     average pool table name
 * @param  {string}   keyword   target keyword
 * @param  {Function} callback  passed through to calcAverage()
 * @return {null}
 */
function subscribeToAveragePool(table, keyword, callback) {
  r.table(table)
    .changes()
    .run(global.db, (err, cursor) => {
      cursor.each((err, row) => {
        if (err) throw err
          calcAverage(table, keyword, callback)
      })
    })
}


/**
 * Calculate average from average pool. called for each change to the average pool.
 * @param  {string}   table     average pool table name
 * @param  {string}   keyword   target average
 * @param  {Function} callback  called every time a new average is calculated from average pool
 * @return {null}
 */
function calcAverage(table, keyword, callback) {
  // retrieve table, calculate average
  let sum = 0
  let count = 0
  r.table(table)
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


/**
 * Add an item to the average pool
 * @param {string} table      name of the average pool
 * @param {object} item       item to be added to the average pool
 * @param {int}    interval   time-to-live for the item being added
 */
function addToPool(table, item, interval) {
  console.log('add')
  r.table(table)
    .insert(item)
    .run(global.db, (err) => {
      if (err) throw error
      let now = Date.now()
      let existed = now - item.new_val.timestamp
      let ttl = interval - existed
      setTimeout(removeFromPool,ttl,table,item)
    })
}


/**
 * Remove an item from the average pool.
 * @param  {string} table name of the average pool
 * @param  {object} item  item being removed from the average pool
 * @return {null}
 */
function removeFromPool(table, item) {
  console.log('remove')
  r.table(table)
    .filter({new_val: {id: item.new_val.id}})
    .delete({returnChanges: true})
    .run(global.db)
}

module.exports = average
