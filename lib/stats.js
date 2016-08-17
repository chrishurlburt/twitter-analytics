const env = require('dotenv').config()
const r = require('rethinkdb')

function Stats() {
  this.average = average;
}

function average(keyword, callback) {

  r.table('tweets')
    .changes()
    .run(global.db)
}

module.exports = Stats
