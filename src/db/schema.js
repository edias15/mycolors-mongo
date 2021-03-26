import Dexie from 'dexie'

var db = new Dexie('colors')

db.version(1).stores({
  list: '[listname+hex], listname, hex, description',
  listnames: '++id, listname'
})

db.open()

export default db
