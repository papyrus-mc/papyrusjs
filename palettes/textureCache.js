const argv = require('../app.js').argv;

module.exports = function () {

    var cache = [];

    this.save = function (name, value, data, y) {
        // if ( argv.verbose == true ) { console.log( '\nSaving new texture to cache.\t' + name + ' ' + value ) };
        cache[JSON.stringify({ name: name, value: value, y: y })] = data;
    };

    this.get = function (name, value, y) {
        return cache[JSON.stringify({ name: name, value: value, y: y })];
    };

    this.list = function () {
        return cache;
    };

    // return chunkLayer;
};