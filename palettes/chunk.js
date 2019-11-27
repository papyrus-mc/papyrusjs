const fs = require('fs');
const Vec3 = require('vec3');

var transparentBlocks = require('../lookup_tables/transparent-blocks_table.json');

module.exports = function (xz) {
    var chunk = {},
        XZ = xz,
        Y = 1;

    this.set = function (x, y, z, name, value, yThreshold) {
        if (y < yThreshold) {
            if (transparentBlocks[name] != true) {
                chunk[new Vec3(x, 0, z)] = { name: name, value: value, y: y };
            } else {
                var iy = 1;
                while (chunk[new Vec3(x, iy, z)] != undefined) {
                    iy++;
                }
                chunk[new Vec3(x, iy, z)] = { name: name, value: value, y: y };
                // console.log( name + ' was transparent. Put it on Y: ' + iy );
            };
        };
    };

    this.get = function (x, y, z) {
        var getBlock = chunk[new Vec3(x, y, z)];

        if (getBlock === undefined) {
            return { name: 'minecraft:air', value: 0 };
        } else {
            return getBlock;
        };
    };

    this.getXZ = function () {
        return XZ;
    };

    this.getHeight = function () {
        return Y;
    };

    this.list = function () {
        return chunk;
    };
};