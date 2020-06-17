const colors = require('colors');
const mapnik = require('mapnik');
const fs = require('fs');
const path = require('path');
const path_output = require('../app.js').path_output;

module.exports = function (chunkSize, zoomLevelMax, chunkX, chunkZ) {
    return new Promise(async function (resolve, reject) {

        let blendArray = [],
            zoomLevelCurrent,
            file,
            tileX = 0,
            tileZ = 0,
            tileImg;

        --zoomLevelMax;
        // for( ix = Math.floor( chunkX[ 0 ]/2 ); ix < ( Math.ceil( chunkX[ 1 ]/2 ) ); ix++ ) {
        for (zoomLevelCurrent = zoomLevelMax; zoomLevelCurrent >= 0; zoomLevelCurrent--) {
            console.log('Rendering zoom level ' + colors.bold(zoomLevelCurrent) + ' out of ' + zoomLevelMax);
            divide();
            for (let iz = 0; iz < chunkZ[1] + Math.abs(chunkZ[0]); iz++) {
                for (let ix = 0; ix < chunkX[1] + Math.abs(chunkX[0]); ix++) {

                    blendArray = []; // Clear array

                    if (!fs.existsSync(path_output + '/map/' + (zoomLevelCurrent) + '/')) {
                        fs.mkdirSync(path_output + '/map/' + (zoomLevelCurrent) + '/');
                    }

                    file = path.normalize(path_output + '/map/' + (zoomLevelCurrent + 1) + '/' + (ix * 2) + '/' + (iz * 2) + '.png');
                    if (fs.existsSync(file)) {
                        blendArray.push({
                            buffer: fs.readFileSync(file),
                            x: 0,
                            y: 0
                        });
                    }

                    file = path.normalize(path_output + '/map/' + (zoomLevelCurrent + 1) + '/' + (ix * 2) + '/' + ((iz * 2) + 1) + '.png');
                    if (fs.existsSync(file)) {
                        blendArray.push({
                            buffer: fs.readFileSync(file),
                            x: 0,
                            y: 256
                        });
                    }

                    file = path.normalize(path_output + '/map/' + (zoomLevelCurrent + 1) + '/' + ((ix * 2) + 1) + '/' + (iz * 2) + '.png');
                    if (fs.existsSync(file)) {
                        blendArray.push({
                            buffer: fs.readFileSync(file),
                            x: 256,
                            y: 0
                        });
                    }

                    file = path.normalize(path_output + '/map/' + (zoomLevelCurrent + 1) + '/' + ((ix * 2) + 1) + '/' + ((iz * 2) + 1) + '.png');
                    if (fs.existsSync(file)) {
                        blendArray.push({
                            buffer: fs.readFileSync(file),
                            x: 256,
                            y: 256
                        });
                    }

                    if (blendArray.length !== 0) {
                        await new Promise((resolve, reject) => {
                            mapnik.blend(blendArray, {
                                width: Math.pow(chunkSize, 2) * 2,
                                height: Math.pow(chunkSize, 2) * 2
                            }, function (err, buffer) {
                                tileImg = mapnik.Image.fromBytesSync(buffer);
                                tileImg = tileImg.resizeSync(Math.pow(chunkSize, 2), Math.pow(chunkSize, 2) /*, { 'scaling_method': mapnik.imageScaling.near } */);
                                if (!fs.existsSync(path.normalize(path_output + '/map/' + (zoomLevelCurrent) + '/' + (ix) + '/'))) {
                                    fs.mkdirSync(path.normalize(path_output + '/map/' + (zoomLevelCurrent) + '/' + (ix) + '/'));
                                }
                                tileImg.saveSync(path.normalize(path_output + '/map/' + (zoomLevelCurrent) + '/' + (ix) + '/' + (iz) + '.png'));
				tileImp = null;
				if (global.gc)
				    global.gc();
                                resolve();
                            }
                            )
                        });
                    }
                }
            }
        }
        resolve();
    });

    function divide() {
        chunkX[0] = chunkX[0] / 2;
        chunkX[1] = chunkX[1] / 2;
        chunkZ[0] = chunkZ[0] / 2;
        chunkZ[1] = chunkZ[1] / 2;
    }
};
