const Vec3 = require( 'vec3' );

module.exports = function() {

    var chunk = { }

    this.set = function( x, y, z, name, value ) {
        chunk[ new Vec3( x, y, z ) ] = { name: name, value: value };
        // console.log( chunk[ new Vec3( x, y, z ) ] );
    };

    this.get = function( x, y, z ) {
        return chunk[ new Vec3 ( x, y, z ) ];
    };

    this.list = function( ) {
        return chunk;
    };

    // return chunkLayer;
};