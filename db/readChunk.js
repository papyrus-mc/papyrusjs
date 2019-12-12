const argv = require("../app.js").argv;
const colors = require('colors');
const nbtParse = require("../db/NbtParse.js");

const Palette_Persistance = require('../palettes/palette_persistance.js');
const runtimeIDTable = require('../app.js').runtimeIDTable;

module.exports = function (value, chunk, yOffset, yThreshold) {
    return new Promise((resolve, reject) => {

        let _offset = 0;
        let SubChunkVersion = value.readInt8(_offset); _offset++;
        let SubChunkYOffset = 16 * yOffset;
        let localPalette;
        let storages = 1;

        switch (SubChunkVersion) {
            case 0:
                let dataArray = value.slice(4097);
                for (let position = 0; position < 4096; position++) {
                    let blockID = value.readInt8(position + 1);
                    let blockData = getData(dataArray, position);

                    let x = (position >> 8) & 0xF,
                        y = position & 0xF,
                        z = (position >> 4) & 0xF;

                    try {
                        if (runtimeIDTable[blockID]['name'] !== 'minecraft:air') {
                            chunk.set(x, y + SubChunkYOffset, z, runtimeIDTable[blockID]['name'], blockData, yThreshold);
                            // console.log( runtimeIDTable[ blockID ] );
                        }
                    } catch (err) {
                        // console.log( blockID + ' ' + err );
                    }
                    // console.log( blockID );
                }
                function getData(dataArray, pos) {
                    let slot = pos >> 1;
                    let part = pos & 1;

                    if (part === 0) {
                        return (dataArray[slot]) & 0xf;
                    }
                    return (dataArray[slot] >> 4) & 0xf;
                }
                break;

            case 8:
                // valid
                storages = value.readInt8(_offset); _offset++;

            case 1:
                // valid

                for (let storage = 0; storage < storages; storage++) {
                    let paletteAndFlag = value.readInt8(_offset); _offset++;
                    let isRuntime = (paletteAndFlag & 1) !== 0;
                    let bitsPerBlock = paletteAndFlag >> 1;
                    let blocksPerWord = Math.floor(32 / bitsPerBlock);
                    let wordCount = Math.ceil(4096 / blocksPerWord);

                    // console.log( 'SubChunk Version:\t' + SubChunkVersion + '\tSize:\t\t' + value.length + '\t Skip to:\t' + ( _offset + ( wordCount * 4 ) ) + '\nRuntime:\t\t' + isRuntime + '\tbits per block:\t' + bitsPerBlock + '\nblocks per word:\t' + blocksPerWord + '\tword count:\t' + wordCount + '\n' );

                    let index_blocks = _offset;
                    _offset += (wordCount * 4);

                    if (!isRuntime) {
                        // NBT TAG SERIALIZER
                        localPalette = new Palette_Persistance(value.readInt32LE(_offset)); _offset += 4;
                        // console.log("\n" + localPalette.size());

                        for (let paletteID = 0; paletteID < localPalette.size(); paletteID++) {
                            nbtParse.parse(value.slice(_offset), (data) => {
                                localPalette.put(paletteID, data[Object.keys(data)[0]].name, 0);
                                _offset += data.bufferSize;
                            });
                        }
                    }

                    let _offset_new = index_blocks;

                    let position = 0;

                    for (let wordi = 0; wordi < wordCount; wordi++) {
                        let word = value.readInt32LE(_offset_new); _offset_new += 4;

                        for (let block = 0; block < blocksPerWord; block++) {
                            let state = (word >> ((position % blocksPerWord) * bitsPerBlock)) & ((1 << bitsPerBlock) - 1);
                            let x = (position >> 8) & 0xF,
                                y = position & 0xF,
                                z = (position >> 4) & 0xF;

                            // console.log( 'State:\t' + state + '\tX:\t' + x + '\tY:\t' + y + '\tZ:\t' + z );
                            // console.log( localPalette.get( state ).name );

                            try {
                                if (localPalette.get(state).name !== 'minecraft:air') {
                                    chunk.set(x, y + SubChunkYOffset, z, localPalette.get(state).name, localPalette.get(state).value, yThreshold);
                                    // console.log( localPalette.get( state ).value );
                                }
                            } catch (err) {
                                if (argv.verbose === true) {
                                    console.log(colors.yellow('\n[WARNING]') + ' Palette ID out of bounds!\t' + state + '\t:\t' + localPalette.size());
                                }
                            }

                            position++;
                        }
                    }
                }
                break;
        }
        resolve();
    });
};