/* global it, describe, beforeEach, afterEach */
// have two test-runs:
// 1. mock db
// 2. real local db

// test-run
// 1. create object (missing parms, real parms)
// 2. setup table (ask for error, real test)
// 3. add object (error, real)

const JSON2MySQL = require('../index.js')
const mysql = require('mysql')
const assert = require('assert')
let j2m = undefined
let config = require('./config.json')
let mockDB = {
  query: function (sql) {
    // TODO: fake a query
  }
}
describe('Object Creation', function () {
  it('should throw an error if "table" is missing in options', function () {
    let newconfig = JSON.parse(JSON.stringify(config))
    delete newconfig.table
    try {
      j2m = new JSON2MySQL(newconfig)
      assert.fail('Should throw an error')
    } catch (e) {
      assert.equal(e.toString().indexOf('Table') > -1, true)
    }
  })
  it('should throw an error if "fields" is missing in options', function () {
    let newconfig = JSON.parse(JSON.stringify(config))
    delete newconfig.fields
    try {
      j2m = new JSON2MySQL(newconfig)
      assert.fail('Should throw an error')
    } catch (e) {
      assert.equal(e.toString().indexOf('Fields') > -1, true)
    }
  })
  it('should throw an error if "mysql" is missing in options', function () {
    let newconfig = JSON.parse(JSON.stringify(config))
    try {
      j2m = new JSON2MySQL(newconfig)
      assert.fail('Should throw an error')
    } catch (e) {
      assert.equal(e.toString().indexOf('Mysql') > -1, true)
    }
  })
  it('should create an object with default values', function () {
    let newconfig = JSON.parse(JSON.stringify(config))
    delete newconfig.engine
    delete newconfig.ignoreInsertError
    newconfig.mysql = mockDB
    try {
      j2m = new JSON2MySQL(newconfig)
      assert.equal(j2m.options.engine, 'InnoDB')
      assert.equal(j2m.options.ignoreInsertError, false)
    } catch (e) {
      assert.fail(e)
    }
  })
  it('should create an object with overriden value for engine', function () {
    let newconfig = JSON.parse(JSON.stringify(config))
    delete newconfig.ignoreInsertError
    newconfig.mysql = mockDB
    try {
      j2m = new JSON2MySQL(newconfig)
      assert.equal(j2m.options.engine, newconfig.engine)
      assert.equal(j2m.options.ignoreInsertError, false)
    } catch (e) {
      assert.fail(e)
    }
  })
  it('should create an object with overriden value for ignoreInsertError', function () {
    let newconfig = JSON.parse(JSON.stringify(config))
    delete newconfig.engine
    newconfig.mysql = mockDB
    try {
      j2m = new JSON2MySQL(newconfig)
      assert.equal(j2m.options.engine, 'InnoDB')
      assert.equal(j2m.options.ignoreInsertError, newconfig.ignoreInsertError)
    } catch (e) {
      assert.fail(e)
    }
  })
})
describe('Test-Run with MockDB', function () {
  describe('Table Setup', function () {
    beforeEach('create Object', function () {
      config.mysql = mockDB
      j2m = new JSON2MySQL(config)
    })
    afterEach('destroy Object', function () {
      j2m = undefined
    })
    it('should create a table (fields only)')
    it('should create a table (fields and indices)')
    it('should create a table (fields and primary)')
    it('should create a table (fields and indices and primary)')
    it('should create a partitioned table (fields and indices and primary)')
    it('should fail if a incorrect datatype is given')
    it('should fail if a incorrect engine is given')
    it('should fail if a given index is not a field')
    it('should fail if a given primary is not a field')
    it('should fail if the table already exists')
  })
  describe('Add JSON-Object', function () {
    beforeEach('create Object', function () {
      config.mysql = mockDB
      j2m = new JSON2MySQL(config)
    })
    afterEach('destroy Object', function () {
      j2m = undefined
    })
    it('should add an object with all fields')
    it('should add an object with missing fields')
    it('should add an object with wrong fields')
    it('should fail if an object has no correct fields')
    it('should fail if an object has not the fields defined as primary')
    it('should fail if object fields do not match the DB-Field-Types')
  })
})
describe('Test-Run with real Database', function () {
  describe('Table Setup', function () {
    beforeEach('create Object', function () {
      config.mysql = mockDB // TODO: replace with open connection
      j2m = new JSON2MySQL(config)
    })
    afterEach('destroy Object', function () {
      j2m = undefined
    })
    it('should create a table (fields only)')
    it('should create a table (fields and indices)')
    it('should create a table (fields and primary)')
    it('should create a table (fields and indices and primary)')
    it('should create a partitioned table (fields and indices and primary)')
    it('should fail if a incorrect datatype is given')
    it('should fail if a incorrect engine is given')
    it('should fail if a given index is not a field')
    it('should fail if a given primary is not a field')
    it('should fail if the table already exists')
  })
  describe('Add JSON-Object', function () {
    beforeEach('create Object', function () {
      config.mysql = mockDB // TODO: replace with open connection
      j2m = new JSON2MySQL(config)
    })
    afterEach('destroy Object', function () {
      j2m = undefined
    })
    it('should add an object with all fields')
    it('should add an object with missing fields')
    it('should add an object with wrong fields')
    it('should fail if an object has no correct fields')
    it('should fail if an object has not the fields defined as primary')
    it('should fail if object fields do not match the DB-Field-Types')
  })
})
