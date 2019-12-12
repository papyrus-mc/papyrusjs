const fs = require('fs');
const vips = require("../app.js").vips;
const path = require('path');

const loadTexture = require('./loadTexture.js');

const renderMode = require('../app.js').renderMode;
const path_output = require('../app.js').path_output;

module.exports = function (Chunk, Cache, size_texture, worldOffset, ZoomLevelMax) {

    return new Promise((resolve, reject) => {
        var chunk = Chunk,
            cache = Cache,
            textureBuffer;

        var zoomLevelMax = ZoomLevelMax;

        var file = null,
            fileExt = '.png';

        render();

        async function render() {
            var ix = 0,
                iy = 0,
                iz = 0,
                chunkX = chunk.getXZ().readInt32LE(0),
                chunkZ = chunk.getXZ().readInt32LE(4);

            var composeArray = new vips.VipsImageArray(256);

            // Render chunk
            // Y-Axis
            for (iy = 0; iy <= chunk.getHeight(); iy++) {
                // Z-Axis
                for (iz = 0; iz < 16; iz++) {
                    // X-Axis
                    for (ix = 0; ix < 16; ix++) {
                        if (chunk.get(ix, iy, iz).name !== 'minecraft:air') {
                            if (renderMode) {
                                switch (renderMode) {
                                    case 'topdown_shaded':
                                        await loadTexture(chunk.get(ix, iy, iz).name, chunk.get(ix, iy, iz).value, ix, iy, iz, chunk.get(ix, iy, iz).y, cache);
                                        textureBuffer = cache.get(chunk.get(ix, iy, iz).name, chunk.get(ix, iy, iz).value, chunk.get(ix, iy, iz).y);
                                };
                            } else {
                                await loadTexture(chunk.get(ix, iy, iz).name, chunk.get(ix, iy, iz).value, ix, iy, iz, 0, cache);
                                textureBuffer = cache.get(chunk.get(ix, iy, iz).name, chunk.get(ix, iy, iz).value, 0);
                            };

                            composeArray.push(textureBuffer);
                        };
                    };
                };
            };

            let chunkImg = vips.arrayJoin(composeArray, 16);

            // Zoomlevel Directory
            if (!fs.existsSync(path.normalize(path_output + '/map/' + zoomLevelMax))) {
                fs.mkdirSync(path.normalize(path_output + '/map/' + zoomLevelMax));
            };
            // X-Coordinate Directory
            if (!fs.existsSync(path.normalize(path_output + '/map/' + zoomLevelMax + '/' + (chunkX + Math.abs(worldOffset['x'][0]))))) {
                fs.mkdirSync(path.normalize(path_output + '/map/' + zoomLevelMax + '/' + (chunkX + Math.abs(worldOffset['x'][0]))));
            };

            vips.toFile(chunkImg, path.normalize(path_output + '/map/' + zoomLevelMax + '/' + (chunkX + Math.abs(worldOffset['x'][0])) + '/' + (chunkZ + Math.abs(worldOffset['z'][0])) + fileExt));
            resolve();
        }
    });
}