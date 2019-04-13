const Vec3 = require( 'vec3' );

module.exports = function() {

    var cache = { }

    // Definitions
    cache[ JSON.stringify( { name: 'minecraft:air', value: 0 } ) ]  = { definition: null };
    cache[ JSON.stringify( { name: 'minecraft:lava', value: 0 } ) ] = { definition: 'minecraft:lava_placeholder' };
    cache[ JSON.stringify( { name: 'minecraft:water', value: 0 } ) ] = { definition: 'minecraft:water_placeholder' };
    cache[ JSON.stringify( { name: 'minecraft:dirt', value: 0 } ) ] = { definition: 'minecraft:grass_carried' };
    cache[ JSON.stringify( { name: 'minecraft:leaves', value: 0 } ) ] = { definition: 'minecraft:leaves_oak_opaque' };


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