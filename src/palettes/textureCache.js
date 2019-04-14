const Vec3 = require( 'vec3' );

module.exports = function() {

    var cache = { }

    this.save = function( name, value, data ) {
        cache[ JSON.stringify( { name: name, value: value } ) ] = data;
    };

    this.get = function( name, value ) {
        var data = cache[ JSON.stringify( { name: name, value: value } ) ];
        return data;
    };

    this.list = function() {
        return cache;
    };

    // return chunkLayer;
};