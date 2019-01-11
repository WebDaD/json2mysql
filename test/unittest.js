/* global it, describe, beforeEach, afterEach */

const JSON2MySQL = require('../index.js')
const assert = require('assert')
let j2m
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
  'engine': 'MyISAM',
  'ignoreInsertError': true,
  'mysqlserver': {
    'host': 'localhost',
    'user': 'mqtt',
    'password': 'mqtt',
    'database': 'mqtt'
  }
}
let correctsql = {
  fieldsonly: 'CREATE TABLE IF NOT EXISTS simple (`id` INT NOT NULL, `timestamp` DATETIME NOT NULL, `title` VARCHAR(255) NOT NULL) ENGINE=MyISAM PARTITION BY KEY (id) PARTITIONS 10',
  fieldsindices: 'CREATE TABLE IF NOT EXISTS simple (`id` INT NOT NULL, `timestamp` DATETIME NOT NULL, `title` VARCHAR(255) NOT NULL, INDEX (`timestamp`) ) ENGINE=MyISAM PARTITION BY KEY (id) PARTITIONS 10',
  fieldsprimary: 'CREATE TABLE IF NOT EXISTS simple (`id` INT NOT NULL, `timestamp` DATETIME NOT NULL, `title` VARCHAR(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=MyISAM PARTITION BY KEY (id) PARTITIONS 10',
  fieldsindicesprimary: 'CREATE TABLE IF NOT EXISTS simple (`id` INT NOT NULL, `timestamp` DATETIME NOT NULL, `title` VARCHAR(255) NOT NULL, INDEX (`timestamp`) , PRIMARY KEY (`id`)) ENGINE=MyISAM PARTITION BY KEY (id) PARTITIONS 10',
  addAll: 'INSERT IGNORE INTO simple SET `id`="1", `timestamp`="2019-01-30 14:23:12", `title`="Test"',
  addWithMissing: 'INSERT IGNORE INTO simple SET `id`="1", `title`="Test"',
  addWithWrong: 'INSERT IGNORE INTO simple SET `id`="1", `title`="Test"'
}
let mockDB = {
  lastQuery: '',
  query: function (sql, callback) {
    this.lastQuery = sql
    callback()
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
      assert.fail(e.toString())
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
      assert.fail(e.toString())
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
      assert.fail(e.toString())
    }
  })
})
describe('Test-Run with MockDB', function () {
  describe('Table Setup', function () {
    beforeEach('create Object', function () {
      let newconfig = JSON.parse(JSON.stringify(config))
      newconfig.mysql = mockDB
      j2m = new JSON2MySQL(newconfig)
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
          assert.equal(mockDB.lastQuery, correctsql.fieldsonly)
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
          assert.equal(mockDB.lastQuery, correctsql.fieldsindices)
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
          assert.equal(mockDB.lastQuery, correctsql.fieldsprimary)
        }
        done()
      })
    })
    it('should create a table (fields and indices and primary)', function (done) {
      j2m.setup(function (error) {
        if (error) {
          assert.fail(error.toString())
        } else {
          assert.equal(mockDB.lastQuery, correctsql.fieldsindicesprimary)
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
    beforeEach('create Object', function () {
      config.mysql = mockDB
      j2m = new JSON2MySQL(config)
    })
    afterEach('destroy Object', function () {
      j2m = undefined
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
          assert.equal(mockDB.lastQuery, correctsql.addAll)
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
          assert.equal(mockDB.lastQuery, correctsql.addWithMissing)
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
          assert.equal(mockDB.lastQuery, correctsql.addWithWrong)
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
