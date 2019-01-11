function JSON2MySQL (options) {
  this.options = options || {}
  this.validtypes = ['INT', 'TEXT', 'TIME', 'DATETIME', 'VARCHAR', 'BIT', 'TINYINT', 'BOOL', 'DATE']
  this.validEngines = ['INNODB', 'BLACKHOLE', 'MYISAM', 'MEMORY', 'ARCHIVE']

  // check needed options
  if (!this.options.table) throw new Error('Table must be specified')
  if (!this.options.fields) throw new Error('Fields must be specified')
  if (!this.options.mysql) throw new Error('Dependency to open Mysql Connection must be given (must be able to use connection.query)')

  // set default values
  if (!this.options.engine) this.options.engine = 'InnoDB'
  if (!this.options.ignoreInsertError) this.options.ignoreInsertError = false

  this.setup = function (callback) {
    let fields = ''
    for (let j = 0; j < this.options.fields.length; j++) {
      const field = this.options.fields[j]
      if (this.validtypes.indexOf(field.type.toUpperCase()) < 0) {
        return callback(new Error('Datatype ' + field.type + ' is not a valid mysql datatype'))
      } else {
        if (field.type === 'VARCHAR') {
          field.type += '(255)'
        }
        fields += '`' + field.field + '` ' + field.type + ' NOT NULL, '
      }
    }
    if (this.options.fields.length > 1) {
      fields = fields.substr(0, fields.length - 2)
    }
    let indices = ''
    if (this.options.indices && this.options.indices.length > 0) {
      for (let j = 0; j < this.options.indices.length; j++) {
        if (!this.isField(this.options.indices[j])) {
          return callback(new Error('Index ' + this.options.indices[j] + ' is not in the List of Fields'))
        } else {
          indices += '`' + this.options.indices[j] + '`, '
        }
      }
      indices = ', INDEX (' + indices.substr(0, indices.length - 2) + ') '
    }
    let primary = ''
    if (this.options.primary && this.options.primary.length > 0) {
      for (let j = 0; j < this.options.primary.length; j++) {
        if (!this.isField(this.options.primary[j])) {
          return callback(new Error('Primary Key ' + this.options.primary[j] + ' is not in the List of Fields'))
        } else {
          primary += '`' + this.options.primary[j] + '`, '
        }
      }
      if (primary.length > 0) {
        primary = ', PRIMARY KEY (' + primary.substr(0, primary.length - 2) + ')'
      }
    }

    if (this.validEngines.indexOf(this.options.engine.toUpperCase()) < 0) {
      return callback(new Error('Engine ' + this.options.engine + ' is not a valid mysql Storage Engine'))
    }
    let SQL = 'CREATE TABLE IF NOT EXISTS ' + this.options.table + ' (' + fields + indices + primary + ')'
    SQL += ' ENGINE=' + this.options.engine
    if (this.options.partioning !== undefined) {
      if (!this.isField(this.options.partioning.on)) {
        return callback(new Error('Partitioning Key ' + this.options.partioning.on + ' is not in the List of Fields'))
      } else {
        SQL += ' PARTITION BY KEY (' + this.options.partioning.on + ') PARTITIONS ' + this.options.partioning.count
      }
    }

    this.options.mysql.query(SQL, callback)
  }

  this.add = function (json, callback) {
    let assignmentList = ''
    for (let i = 0; i < this.options.fields.length; i++) {
      const field = this.options.fields[i].field
      if(json[field]) {
        assignmentList += '`' + field + '`="' + json[field].toString().replace(/"/g, '\\"') + '", '
      }
    }
    assignmentList = assignmentList.substr(0, assignmentList.length - 2)
    if (assignmentList.length < 1) {
      return callback(new Error('No correct Fields in Object'))
    }
    if(!this.hasPrimaries(json)) {
      return callback(new Error('Primary Key not fullfilled in Object'))
    }
    let SQL = 'INSERT ' + (this.options.ignoreInsertError ? 'IGNORE' : '') + ' INTO ' + this.options.table + ' SET ' + assignmentList
    this.options.mysql.query(SQL, callback)
  }

  this.isField = function (field) {
    for (let index = 0; index < this.options.fields.length; index++) {
      const f = this.options.fields[index]
      if (f.field === field) {
        return true
      }
    }
    return false
  }

  this.hasPrimaries = function (json) {
    let primaryCount = this.options.primary.length
    let actualCount = 0
    for (let index = 0; index < this.options.primary.length; index++) {
      const p = this.options.primary[index]
      if (json[p]) {
        actualCount++
      }
    }
    return actualCount === primaryCount
  }

  return this
}
module.exports = JSON2MySQL
