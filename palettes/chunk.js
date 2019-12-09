const Vec3 = require('vec3');

var transparentBlocks = require('../lookup_tables/transparent-blocks_table.json');

module.exports = class Chunk {
    constructor(xz) {
        this.chunkData = {};
        this.XZ = xz;
        this.Y = 1;
    }

    set(x, y, z, name, value, yThreshold) {
        if (y < yThreshold) {
            if (transparentBlocks[name] != true) {
                this.chunkData[new Vec3(x, 0, z)] = { name: name, value: value, y: y };
            } else {
                var iy = 1;
                while (this.chunkData[new Vec3(x, iy, z)] != undefined) {
                    iy++;
                }
                this.chunkData[new Vec3(x, iy, z)] = { name: name, value: value, y: y };
                // console.log( name + ' was transparent. Put it on Y: ' + iy );
            };
        };
    }

    get(x, y, z) {
        var getBlock = this.chunkData[new Vec3(x, y, z)];

        if (getBlock === undefined) {
            return { name: 'minecraft:air', value: 0 };
        } else {
            return getBlock;
        };
    }

    getXZ() {
        return this.XZ;
    }

    getHeight() {
        return this.Y;
    };

    list() {
        return chunkData;
    };
};