const JSON2MySQL = require('../index.js')
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'mqtt',
  password: 'mqtt',
  database: 'mqtt'
})
try {
  connection.connect()
} catch (e) {
  console.error(e)
  process.exit(5)
}

let j2m = new JSON2MySQL({
  table: 'simple',
  fields: [
    {
      'field': 'id',
      'type': 'INT'
    },
    {
      'field': 'timestamp',
      'type': 'DATETIME'
    },
    {
      'field': 'title',
      'type': 'VARCHAR(255)'
    }
  ],
  indices: ['timestamp'],
  primary: ['id'],
  partioning: {
    on: 'timestamp',
    count: 10
  },
  engine: 'MyISAM',
  ignoreInsertError: true,
  mysql: connection
})

j2m.setup(function (err) {
  if (err) {
    console.error(err)
    process.exit(5)
  }
  let json = {
    id: 1,
    timestamp: '2019-01-10 10:00:00',
    title: 'Test-data'
  }
  j2m.add(json, function (err) {
    if (err) {
      console.error(err)
    }
  })
})
