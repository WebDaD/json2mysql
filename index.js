function JSON2MySQL (options) {
  this.options = options || {}

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
      fields += '`' + field.field + '` ' + field.type + ' NOT NULL, '
    }
    if (this.options.fields.length < 1) {
      fields = fields.substr(0, fields.length - 2)
    }
    let indices = ''
    for (let j = 0; j < this.options.indices.length; j++) {
      indices += '`' + this.options.indices[j] + '`, '
    }
    indices = ', INDEX (' + indices.substr(0, indices.length - 2) + ') '

    let primary = ''
    for (let j = 0; j < this.options.primary.length; j++) {
      primary += '`' + this.options.primary[j] + '`, '
    }
    if (primary.length > 0) {
      primary = ', PRIMARY KEY (' + primary.substr(0, primary.length - 2) + ')'
    }

    let SQL = 'CREATE TABLE IF NOT EXISTS ' + this.options.table + ' (' + fields + indices + primary + ')'
    SQL += ' ENGINE=' + this.options.engine
    if (this.options.partioning !== undefined) {
      SQL += ' PARTITION BY KEY (' + this.options.partioning.on + ') PARTITIONS ' + this.options.partioning.count
    }

    this.mysql.query(SQL, callback)
  }

  this.add = function (json, callback) {
    let assignmentList = ''
    for (let i = 0; i < this.options.fields.length; i++) {
      const field = this.options.fields[i].field
      assignmentList += '`' + field + '`="' + json[field].toString().replace(/"/g, '\\"') + '", '
    }
    assignmentList = assignmentList.substr(0, assignmentList.length - 2)
    let SQL = 'INSERT ' + (this.options.ignoreInsertError ? 'IGNORE' : '') + ' INTO ' + this.options.table + ' SET ' + assignmentList
    this.mysql.query(SQL, callback)
  }

  return this
}
module.exports = JSON2MySQL
