const Vec3 = require( 'vec3' );

module.exports = function() {

    var cache = { }

    // Definitions
    cache[ JSON.stringify( { name: 'minecraft:air', value: 0 } ) ]  = { definition: null };
    cache[ JSON.stringify( { name: 'minecraft:lava', value: 0 } ) ] = { definition: 'minecraft:lava_placeholder' };
    cache[ JSON.stringify( { name: 'minecraft:water', value: 0 } ) ] = { definition: 'minecraft:water_placeholder' };
    cache[ JSON.stringify( { name: 'minecraft:grass', value: 0 } ) ] = { definition: 'minecraft:grass_carried' };
    cache[ JSON.stringify( { name: 'minecraft:leaves', value: 0 } ) ] = { definition: 'minecraft:leaves_oak_opaque' };
    cache[ JSON.stringify( { name: 'minecraft:red_flower', value: 0 } ) ] = { definition: 'minecraft:flower_rose' };
    cache[ JSON.stringify( { name: 'minecraft:double_plant', value: 0 } ) ] = { definition: 'minecraft:double_plant_grass_carried' };
    cache[ JSON.stringify( { name: 'minecraft:stone_slab', value: 0 } ) ] = { definition: 'minecraft:stone_slab_top' };
    cache[ JSON.stringify( { name: 'minecraft:planks', value: 0 } ) ] = { definition: 'minecraft:planks_oak' };
    cache[ JSON.stringify( { name: 'minecraft:mossy_cobblestone', value: 0 } ) ] = { definition: 'minecraft:cobblestone_mossy' };
    cache[ JSON.stringify( { name: 'minecraft:stone_stairs', value: 0 } ) ] = { definition: 'minecraft:stone' };
    cache[ JSON.stringify( { name: 'minecraft:oak_stairs', value: 0 } ) ] = { definition: 'minecraft:planks_oak' };
    cache[ JSON.stringify( { name: 'minecraft:glass_pane', value: 0 } ) ] = { definition: 'minecraft:glass_pane_top' };
    cache[ JSON.stringify( { name: 'minecraft:yellow_flower', value: 0 } ) ] = { definition: 'minecraft:flower_dandelion' };
    cache[ JSON.stringify( { name: 'minecraft:furnace', value: 0 } ) ] = { definition: 'minecraft:furnace_top' };
    cache[ JSON.stringify( { name: 'minecraft:brown_mushroom', value: 0 } ) ] = { definition: 'minecraft:mushroom_block_skin_brown' };
    cache[ JSON.stringify( { name: 'minecraft:red_mushroom', value: 0 } ) ] = { definition: 'minecraft:mushroom_block_skin_red' };
    cache[ JSON.stringify( { name: 'minecraft:wooden_door', value: 0 } ) ] = { definition: 'minecraft:door_wood_upper' };
    cache[ JSON.stringify( { name: 'minecraft:log', value: 0 } ) ] = { definition: 'minecraft:log_oak_top' };
    cache[ JSON.stringify( { name: 'minecraft:double_stone_slab', value: 0 } ) ] = { definition: 'minecraft:stone_slab_top' };
    cache[ JSON.stringify( { name: 'minecraft:chest', value: 0 } ) ] = { definition: 'minecraft:chest_top' };
    cache[ JSON.stringify( { name: 'minecraft:enderchest', value: 0 } ) ] = { definition: 'minecraft:enderchest_top' };
    cache[ JSON.stringify( { name: 'minecraft:farmland', value: 0 } ) ] = { definition: 'minecraft:farmland_wet' };
    cache[ JSON.stringify( { name: 'minecraft:carrots', value: 0 } ) ] = { definition: 'minecraft:carrots_stage_3' };
    cache[ JSON.stringify( { name: 'minecraft:wheat', value: 0 } ) ] = { definition: 'minecraft:wheat_stage_7' };
    cache[ JSON.stringify( { name: 'minecraft:grass_path', value: 0 } ) ] = { definition: 'minecraft:grass_path_top' };
    cache[ JSON.stringify( { name: 'minecraft:sandstone', value: 0 } ) ] = { definition: 'minecraft:sandstone_normal' };
    // cache[ JSON.stringify( { name: 'minecraft:reeds', value: 0 } ) ] = { definition: null };
    
    
    



    


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