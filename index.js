const { Database } = require('bindings')('node_leveldb_mcpe_native.node')

const util = require('util')
const { AbstractLevelDOWN, AbstractIterator } = require('abstract-leveldown')

class MinecraftAbstractIterator extends AbstractIterator {
  constructor (store) {
    super()
    this._store = store
    this._iterator_store = this._store.iteratorNew()
  }

  _next (callback) {
    const iterator = this._iterator_store

    if (!this._store.iteratorValid(iterator)) {
      callback(null, undefined, undefined)
      return
    }

    const key = Buffer.from(this._store.iteratorKey(iterator)).toString( 'hex' )
    const value = Buffer.from(this._store.iteratorValue(iterator)).toString( 'hex' )
    this._store.iteratorNext(iterator)
    callback(null, key, value)
  }

  _end (callback) {
    this._store.iteratorDestroy(this._iterator_store)
    callback()
  }
}

class MinecraftLevelDOWN {
  constructor (location) {
    AbstractLevelDOWN.call(this, location)
  }

  _open (options, callback) {
    this._store = new Database(this.location)
    process.nextTick(function () { callback(null, this) }.bind(this))
  }

  _put (key, value, options, callback) {
    this._store.put(key, value)
    process.nextTick(callback)
  }

  _get (key, options, callback) {
    const value = this._store.get(key)

    if (value === undefined) {
      // 'NotFound' error, consistent with LevelDOWN API
      return process.nextTick(function () { callback(new Error('NotFound')) })
    }

    process.nextTick(function () {
      callback(null, value)
    })
  }

  _del (key, options, callback) {
    this._store.delete(key)
    process.nextTick(callback)
  }

  _close (callback) {
    this._store.close()
    process.nextTick(callback)
  }

  _iterator (options) {
    return new MinecraftAbstractIterator(this._store)
  }
}

util.inherits(MinecraftLevelDOWN, AbstractLevelDOWN)

module.exports = MinecraftLevelDOWN
