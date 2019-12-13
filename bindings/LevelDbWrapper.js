/**
 * Extremely basic and stripped-down wrapper class to directly call LevelDB library.
 * 
 * This class is able to call an external LevelDB library using the "Foreign Function Interface" module.
 * It supports synchronously iterating through a database and reading data. Writing isn't implemented yet.
 * @author clarkx86
 */

const ffi = require("ffi"),
      ref = require("ref");

module.exports = class LevelDbWrapper {
    constructor(libPath) {
        this.leveldb_db = ref.refType(ref.types.Object);
        this.leveldb_options = ref.refType(ref.types.void);
        this.leveldb_comparator = ref.refType(ref.types.void);
        this.leveldb_snapshot = ref.refType(ref.types.Object);
        this.leveldb_options_set_comparator = this.leveldb_comparator;
        this.leveldb_options_create_if_missing = ref.types.bool;
        this.leveldb_options_paranoid_checks = ref.types.bool;
    
        this.leveldb_readoptions = ref.refType(ref.types.Object);
        this.leveldb_readoptions_verify_checksums = ref.types.bool;
        this.leveldb_readoptions_fill_cache = ref.types.bool;
    
        this.leveldb_iterator = ref.refType(ref.types.Object);
        this.KeyType = ref.refType(ref.types.Object);
        this.ValueType = ref.refType(ref.types.Object);
    
        this._db = null;
        this._options = null;
        this._readoptions = null;
        this._ite = null;
    
        this.KeyPointer = ref.refType(ref.types.Object);
        this.ErrPointer = ref.refType(ref.types.CString);
        this.keySizePointer = null;
        this.valueSizePointer = null;

        this.levelDbLib = ffi.Library(require("path").resolve(libPath), {
            "leveldb_open": [this.leveldb_db, [this.leveldb_options, "string"]],
            "leveldb_close": [ref.types.void, [this.leveldb_db]],
            "leveldb_get": [this.ValueType, [this.leveldb_db, this.leveldb_readoptions, this.KeyPointer, ref.types.size_t, ref.refType(ref.types.size_t), this.ErrPointer]],
            "leveldb_create_iterator": [this.leveldb_iterator, [this.leveldb_db, this.leveldb_readoptions]],
            "leveldb_iter_destroy": [ref.types.void, [this.leveldb_iterator]],
            "leveldb_iter_valid": [ref.types.byte, [this.leveldb_iterator]],
            "leveldb_iter_seek_to_first": [ref.types.void, [this.leveldb_iterator]],
            "leveldb_iter_seek_to_last": [ref.types.void, [this.leveldb_iterator]],
            "leveldb_iter_next": [ref.types.void, [this.leveldb_iterator]],
            "leveldb_iter_prev": [ref.types.void, [this.leveldb_iterator]],
            "leveldb_iter_key": [this.KeyType, [this.leveldb_iterator, ref.refType(ref.types.size_t)]],
            "leveldb_iter_value": [this.ValueType, [this.leveldb_iterator, ref.refType(ref.types.size_t)]],
            "leveldb_options_create": [this.leveldb_options, []],
            "leveldb_options_set_create_if_missing": ["void", [this.leveldb_options, this.leveldb_options_create_if_missing]],
            "leveldb_options_set_compression": ["void", [this.leveldb_options, ref.types.int]],
            "leveldb_options_destroy": ["void", [this.leveldb_options]],
            "leveldb_readoptions_create": [this.leveldb_readoptions, []],
            "leveldb_readoptions_destroy": [ref.types.void, [this.leveldb_readoptions]],
            "leveldb_readoptions_set_verify_checksums": [ref.types.void, [this.leveldb_readoptions, ref.types.bool]],
            "leveldb_readoptions_set_fill_cache": [ref.types.void, [this.leveldb_readoptions, ref.types.bool]],
            "leveldb_readoptions_set_snapshot": [ref.types.void, [this.leveldb_readoptions, this.leveldb_snapshot]]
        });
    }

    open(path, callback) {
        this._options = this.levelDbLib.leveldb_options_create();
        this._readoptions = this.levelDbLib.leveldb_readoptions_create();

        this.levelDbLib.leveldb_options_set_compression(this._options, 4);
        this._db = this.levelDbLib.leveldb_open(this._options, path);
    
        // Create iterator
        this._ite = this.levelDbLib.leveldb_create_iterator(this._db, this._readoptions);

        callback();
    }

    close(callback) {
        this.levelDbLib.leveldb_readoptions_destroy(this._readoptions);
        this.levelDbLib.leveldb_options_destroy(this._options);
        this.levelDbLib.leveldb_iter_destroy(this._ite);
        this.levelDbLib.leveldb_close(this._db);

        callback();
    }

    iterate(callback) {
        // Iterate through every entry
        for (this.levelDbLib.leveldb_iter_seek_to_first(this._ite); this.levelDbLib.leveldb_iter_valid(this._ite) !== 0; this.levelDbLib.leveldb_iter_next(this._ite)) {
            // Allocate a key- and value size address of size_t to pass onto the LevelDB function
            this.keySizePointer = ref.alloc(ref.types.size_t, 0);
            this.valueSizePointer = ref.alloc(ref.types.size_t, 0);

            /*
             *  TODO: Find a solution for duplicate entry calling.
             */

            this.levelDbLib.leveldb_iter_key(this._ite, this.keySizePointer),
            this.levelDbLib.leveldb_iter_value(this._ite, this.valueSizePointer);

            this.KeyType.size = this.keySizePointer.readInt32LE(0);
            this.ValueType.size = this.valueSizePointer.readInt32LE(0);

            let key = Buffer.alloc(this.KeyType.size, this.levelDbLib.leveldb_iter_key(this._ite, this.keySizePointer));
                value = Buffer.alloc(this.ValueType.size, this.levelDbLib.leveldb_iter_value(this._ite, this.valueSizePointer));

            callback(key, value);
        }
    }

    get(key, callback) {
        this.valueSizePointer = ref.alloc(ref.types.size_t, 0);
        this.ErrPointer = ref.allocCString(null, "utf-8");
        
        this.levelDbLib.leveldb_get(this._db, this._readoptions, key, key.length, this.valueSizePointer, this.ErrPointer);
        this.ValueType.size = this.valueSizePointer.readInt32LE(0);
        let data = Buffer.alloc(this.ValueType.size, this.levelDbLib.leveldb_get(this._db, this._readoptions, key, key.length, this.valueSizePointer, this.ErrPointer));

        callback(ref.isNull(this.ErrPointer) ? null : this.ErrPointer, data);
    }
};
