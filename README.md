# json2mysql

Allows to write a JSON-Object as fields into a mysql-table.

IMPORTANT: Use one instance for one type of object with one table.  
If you want to use multiple json-types, create multiple instances!

## Installation

Just use `npm install lib-json2mysql`

## Usage

The Usage is simple, the config is extensive :-)

`const JSON2MySQL = require('lib-json2mysql')`  

`let j2m = new JSON2MySQL(config)`  

`j2m.setup(callback)`  

### Insert an Object

Just use:  

`j2m.add(json, callback)`  

## Config

There are a lot of config parameters to give.  
Just see config.sample.json for a full example of all options.

### Required

* table: The Name of the Table in the Database to use
* fields: An Array of json-names mapped to MySQL-Database-Field-Types
* mysql: An open Connection to a MySQL-Database

### Optional

* indices: An Array of fields that should be indexed
* primary: An Array of fields that should be used as a (combined) Primary Key
* partioning: Allows for Partioning, expects the fields "on" (name of the field) and "count"(Number of partitions)
* engine: The Engine to use. Default is InnoDB
* ignoreInsertError: Ignore any Insert Errors. Default is false

## Testing

To Test you may install the dev-dependencies, then fire up a local database.  
Then just run `npm run test`