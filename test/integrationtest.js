/* global it, describe, beforeEach, afterEach, before, after */

const JSON2MySQL = require('../index.js')
const mysql = require('mysql')
const assert = require('assert')
let j2m
let mysqlConnection
let config = {
  'table': 'simple',
  'fields': [
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
      'type': 'VARCHAR'
    }
  ],
  'indices': [
    'timestamp'
  ],
  'primary': [
    'id'
  ],
  'partioning': {
    'on': 'id',
    'count': 10
  },
  'engine': 'Memory',
  'ignoreInsertError': true,
  'mysqlserver': {
    'host': 'localhost',
    'user': 'test',
    'password': 'test',
    'database': 'test'
  }
}
describe('Test-Run with real Database', function () {
  before('Connect to Database', function (done) {
    mysqlConnection = mysql.createConnection(config.mysqlserver)
    try {
      mysqlConnection.connect()
      done()
    } catch (e) {
      console.error(e)
      process.exit(5)
    }  
  })
  after('Close Connection', function (done) {
    mysqlConnection.end(function () {
      done()
    })
  })
  describe('Table Setup', function () {
    beforeEach('create Object', function (done) {
      let newconfig = JSON.parse(JSON.stringify(config))
      newconfig.mysql = mysqlConnection
      j2m = new JSON2MySQL(newconfig)
      mysqlConnection.query('DROP TABLE IF EXISTS simple', function (err) {
        if (err) {
          console.error(err)
          process.exit(5)
        } else {
          done()
        }
      })
    })
    afterEach('destroy Object', function () {
      j2m = undefined
    })
    it('should create a table (fields only)', function (done) {
      delete j2m.options.indices
      delete j2m.options.primary
      j2m.setup(function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          // TODO: check in database
        }
        done()
      })
    })
    it('should create a table (fields and indices)', function (done) {
      delete j2m.options.primary
      j2m.setup(function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          // TODO: check in database
        }
        done()
      })
    })
    it('should create a table (fields and primary)', function (done) {
      delete j2m.options.indices
      j2m.setup(function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          // TODO: check in database
        }
        done()
      })
    })
    it('should create a table (fields and indices and primary)', function (done) {
      j2m.setup(function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          // TODO: check in database
        }
        done()
      })
    })
    it('should fail if a incorrect datatype is given', function (done) {
      j2m.options.fields[0].type = 'FOO'
      j2m.setup(function (error) {
        if (error) {
          assert.equal(error.toString().indexOf('Datatype') > -1, true)
        } else {
          assert.fail('Here should be an Error...')
        }
        done()
      })
    })
    it('should fail if a incorrect engine is given', function (done) {
      j2m.options.engine = 'FOO'
      j2m.setup(function (error) {
        if (error) {
          assert.equal(error.toString().indexOf('Engine') > -1, true)
        } else {
          assert.fail('Here should be an Error...')
        }
        done()
      })
    })
    it('should fail if a given index is not a field', function (done) {
      j2m.options.indices[0] = 'FOO'
      j2m.setup(function (error) {
        if (error) {
          assert.equal(error.toString().indexOf('Index') > -1, true)
        } else {
          assert.fail('Here should be an Error...')
        }
        done()
      })
    })
    it('should fail if a given primary is not a field', function (done) {
      j2m.options.primary[0] = 'FOO'
      j2m.setup(function (error) {
        if (error) {
          assert.equal(error.toString().indexOf('Primary') > -1, true)
        } else {
          assert.fail('Here should be an Error...')
        }
        done()
      })
    })
    it('should fail if a given partitioning Key is not a field', function (done) {
      j2m.options.partioning.on = 'FOO'
      j2m.setup(function (error) {
        if (error) {
          assert.equal(error.toString().indexOf('Partitioning') > -1, true)
        } else {
          assert.fail('Here should be an Error...')
        }
        done()
      })
    })
  })
  describe('Add JSON-Object', function () {
    before('create Object', function (done) {
      config.mysql = mysqlConnection
      j2m = new JSON2MySQL(config)
      j2m.setup(done)
    })
    after('destroy Object', function () {
      j2m = undefined
    })
    beforeEach('create Object', function (done) {
      // TODO: Truncate table
      done()
    })
    it('should add an object with all fields', function (done) {
      j2m.add({
        id: 1,
        timestamp: '2019-01-30 14:23:12',
        title: 'Test'
      }, function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          // TODO: check in database
        }
        done()
      })
    })
    it('should add an object with missing fields', function (done) {
      j2m.add({
        id: 1,
        title: 'Test'
      }, function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          // TODO: check in database
        }
        done()
      })
    })
    it('should add an object with wrong fields (Ignore them)', function (done) {
      j2m.add({
        id: 1,
        foo: 'somevalue',
        title: 'Test'
      }, function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          // TODO: check in database
        }
        done()
      })
    })
    it('should fail if an object has no correct fields', function (done) {
      j2m.add({
        foo: 'somevalue'
      }, function (error) {
        if (error) {
          assert.equal(error.toString().indexOf('Fields') > -1, true)
        } else {
          assert.fail('Here should be an Error...')
        }
        done()
      })
    })
    it('should fail if an object has not the fields defined as primary', function (done) {
      j2m.add({
        timestamp: '2019-01-30 14:23:12',
        title: 'Test'
      }, function (error) {
        if (error) {
          assert.equal(error.toString().indexOf('Primary') > -1, true)
        } else {
          assert.fail('Here should be an Error...')
        }
        done()
      })
    })
  })
})
