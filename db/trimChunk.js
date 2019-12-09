const Chunk = require('../palettes/chunk.js');

module.exports = function (srcChunk, Table) {
    var chunk = [],
        trimArray = [],
        blockName = null,
        blockValue = null,
        count = 0,
        table = Table;

    chunk[0] = srcChunk;
    chunk[1] = new Chunk(chunk[0].getXZ());

    // Create 2D array
    for (i = 0; i < 16; i++) {
        trimArray[i] = new Array();

        for (j = 0; j < 16; j++) {
            trimArray[i][j] = 0;
        };
    };

    for (iy = 255; iy >= 0; iy--) {
        for (ix = 0; ix < 16; ix++) {
            for (iz = 0; iz < 16; iz++) {
                trim();
            };
            trim();
        };
    };

    function trim() {
        blockName = chunk[0].get(ix, iy, iz).name;
        blockValue = chunk[0].get(ix, iy, iz).value;

        if ((trimArray[ix][iz] === 0) && (blockName != 'minecraft:air')) {
            if (isTransparent(blockName) !== true) {
                trimArray[ix][iz] = 1;
            };
            chunk[1].set(ix, iy, iz, blockName, blockValue);
        };
    };

    // console.log( chunk[ 1 ].list() );

    Object.keys(chunk[1].list()).forEach(function () {
        count++;
    });

    function isTransparent(name) {
        if (table[name] == true) {
            return true;
        } else {
            return false;
        };
    };

    // Update chunk
    return chunk[1];

    // console.log( 'Trimmed chunk contains ' + count + ' blocks.' );
};