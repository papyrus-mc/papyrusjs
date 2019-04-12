const Vec3 = require( 'vec3' );

module.exports = function() {

    var cache = { }

    this.set = function( type, value ) {
        chunk[ new Vec3( x, y, z ) ] = { type: type, value: value };
        // console.log( chunk[ new Vec3( x, y, z ) ] );
    };

    this.get = function( x, y, z ) {
        // return chunk[ new Vec3 ( x, y, z ) ];
        return chunk;
    };

    // return chunkLayer;
};