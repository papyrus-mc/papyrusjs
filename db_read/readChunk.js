const argv = require("../app.js").argv;
const colors = require('colors');
const nbt = require('prismarine-nbt');

const Palette_Persistance = require('../palettes/palette_persistance.js');
const runtimeIDTable = require('../app.js').runtimeIDTable;

module.exports = function (value, chunk, yOffset, yThreshold) {
    return new Promise((resolve, reject) => {

        var _offset = 0;
        var SubChunkVersion = value.readInt8(_offset); _offset++;
        var SubChunkYOffset = 16 * yOffset;

        var storages = 1;

        switch (SubChunkVersion) {
            case 0:
                var dataArray = value.slice(4097);
                for (position = 0; position < 4096; position++) {
                    var blockID = value.readInt8(position + 1);
                    var blockData = getData(dataArray, position);

                    var x = (position >> 8) & 0xF,
                        y = position & 0xF,
                        z = (position >> 4) & 0xF;

                    try {
                        if (runtimeIDTable[blockID]['name'] != 'minecraft:air') {
                            chunk.set(x, y + SubChunkYOffset, z, runtimeIDTable[blockID]['name'], blockData, yThreshold);
                            // console.log( runtimeIDTable[ blockID ] );
                        };
                    } catch (err) {
                        // console.log( blockID + ' ' + err );
                    };
                    // console.log( blockID );
                };
                function getData(dataArray, pos) {
                    var slot = pos >> 1;
                    var part = pos & 1;

                    if (part == 0) {
                        return (dataArray[slot]) & 0xf;
                    }
                    else {
                        return (dataArray[slot] >> 4) & 0xf;
                    }
                }
                break;

            case 8:
                // valid
                storages = value.readInt8(_offset); _offset++;

            case 1:
                // valid

                for (storage = 0; storage < storages; storage++) {
                    var paletteAndFlag = value.readInt8(_offset); _offset++;
                    var isRuntime = (paletteAndFlag & 1) != 0;
                    var bitsPerBlock = paletteAndFlag >> 1;
                    var blocksPerWord = Math.floor(32 / bitsPerBlock);
                    var wordCount = Math.ceil(4096 / blocksPerWord);

                    // console.log( 'SubChunk Version:\t' + SubChunkVersion + '\tSize:\t\t' + value.length + '\t Skip to:\t' + ( _offset + ( wordCount * 4 ) ) + '\nRuntime:\t\t' + isRuntime + '\tbits per block:\t' + bitsPerBlock + '\nblocks per word:\t' + blocksPerWord + '\tword count:\t' + wordCount + '\n' );

                    var index_blocks = _offset;
                    _offset += (wordCount * 4);

                    if (isRuntime) {
                        // RuntimeID SERIALIZER
                        /*
                            Most likely not necessary for saved worlds
                        */
                    } else {
                        // NBT TAG SERIALIZER
                        var localPalette = new Palette_Persistance(value.readInt32LE(_offset)); _offset += 4;

                        var _offset_nbt = 0;

                        // console.log( localPalette.size() );

                        for (paletteID = 0; paletteID < localPalette.size(); paletteID++) {
                            /*
                            console.log("\n\nVALUE:");
                            console.log(value.slice(_offset));
                            */
                            nbt.parse(value.slice(_offset), true, function (err, data) {

                                _offset_nbt = 3 + data.value.name.value.length + 2 + 16; // 1 Byte: Tag Type, 2 Bytes: Name Length, next Bytes: String Length, 2 Bytes: TAG_SHORT, 16 Bytes: Magic Number 

                                localPalette.put(paletteID, data.value.name.value, data.value.val.value);

                                // console.log( paletteID + '\t' + localPalette.get( paletteID ).name + '\t' + localPalette.get( paletteID ).value );

                                _offset += _offset_nbt;
                            });
                        };
                    };

                    var index_AfterPalette = _offset;
                    _offset_new = index_blocks;

                    var position = 0;

                    for (wordi = 0; wordi < wordCount; wordi++) {
                        var word = value.readInt32LE(_offset_new); _offset_new += 4;

                        for (block = 0; block < blocksPerWord; block++) {
                            var state = (word >> ((position % blocksPerWord) * bitsPerBlock)) & ((1 << bitsPerBlock) - 1);
                            var x = (position >> 8) & 0xF,
                                y = position & 0xF,
                                z = (position >> 4) & 0xF;

                            // console.log( 'State:\t' + state + '\tX:\t' + x + '\tY:\t' + y + '\tZ:\t' + z );
                            // console.log( localPalette.get( state ).name );

                            try {
                                if (localPalette.get(state).name != 'minecraft:air') {
                                    chunk.set(x, y + SubChunkYOffset, z, localPalette.get(state).name, localPalette.get(state).value, yThreshold);
                                    // console.log( localPalette.get( state ).value );
                                };
                            } catch (err) {
                                if (argv.verbose == true) {
                                    console.log(colors.yellow('\n[WARNING]') + ' Palette ID out of bounds!\t' + state + '\t:\t' + localPalette.size());
                                }
                            };

                            position++;
                        };
                    };
                };
                break;
        };
        resolve();
    });
};