const argv = require( '../app.js' ).argv;

module.exports = function() {

    var cache = [ ];

    this.save = function( name, value, data ) {
        // if ( argv.verbose == true ) { console.log( '\nSaving new texture to cache.\t' + name + ' ' + value ) };
        cache[ JSON.stringify( { name: name, value: value } ) ] = data;
    };

    this.get = function( name, value ) {
        return cache[ JSON.stringify( { name: name, value: value } ) ];
    };

    this.list = function() {
        return cache;
    };

    // return chunkLayer;
};