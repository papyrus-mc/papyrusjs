const db          = require( '../app.js' ).db;
const Chunk       = require( '../app.js' ).Chunk;
const SmartBuffer = require( '../app.js' ).SmartBuffer;
const nbt         = require( '../app.js' ).nbt;
const colors      = require( '../app.js' ).colors;
const Vec3        = require( '../app.js' ).Vec3;

const Palette_Persistance = require( '../palettes/palette_persistance.js' );

var readChunk = function( key, chunk ) {
    try {
        db.get( Buffer.from( key ), function( err, value ) {

            if ( err )
            {
                console.log( colors.red( '[READ ERROR]' ) + ' Skiping... ' + err );
            } else {

                var _offset = 0;
                var SubChunkVersion = value.readInt8( _offset ); _offset++;
                var SubChunkYOffset = 16 * key.readInt8( 9 );
                // console.log( SubChunkYOffset );

                var storages = 1;

                switch( SubChunkVersion )
                {
                    case 8:
                        // valid
                        storages = value.readInt8( _offset ); _offset++;

                    case 1:
                        // valid

                        for( storage = 0; storage < storages; storage++ )
                        {
                            var paletteAndFlag = value.readInt8( _offset ); _offset++;
                            var isRuntime      = ( paletteAndFlag & 1 ) != 0;
                            var bitsPerBlock   = paletteAndFlag >> 1;
                            var blocksPerWord  = Math.floor( 32 / bitsPerBlock );
                            var wordCount      = Math.ceil( 4096.0 / blocksPerWord )
                            
                            // console.log( 'SubChunk Version:\t' + SubChunkVersion + '\tSize:\t\t' + value.length + '\t Skip to:\t' + ( _offset + ( wordCount * 4 ) ) + '\nRuntime:\t\t' + isRuntime + '\tbits per block:\t' + bitsPerBlock + '\nblocks per word:\t' + blocksPerWord + '\tword count:\t' + wordCount + '\n' );
                            
                            var index_blocks = _offset;
                            _offset          = _offset + ( wordCount * 4 );

                            if ( isRuntime )
                            {
                                // NUMBER SERIALIZER
                                /*
                                    Is this even necessary for saved worlds?
                                */
                            } else
                            {
                                // NBT TAG SERIALIZER
                                if ( _offset < value.length ) // Strange bug where _offset is higher than value size
                                {

                                    var PaletteSize = value.readInt32LE( _offset ); _offset += 4;
                                    var TagSize      = Math.ceil( ( value.length - _offset ) / PaletteSize );
                                    // console.log( 'Palette size:\t' + PaletteSize );

                                    var localPalette = new Palette_Persistance;

                                    // console.log( value.slice( _offset ).toString( 'utf8' ) );

                                    var _offset_nbt = 0;

                                    for( i = 0; i < PaletteSize; i++ )
                                    {
                                        nbt.parse( value.slice( _offset ), true, function( err, data ) {
                                            if ( err ) { 

                                            };

                                            _offset_nbt = 3 + data.value.name.value.length + 2 + 16; // 1 Byte: Tag Type, 2 Bytes: Name Length, next Bytes: String Length, 2 Bytes: TAG_SHORT, 16 Bytes: Magic Number 
                                            // console.log( _offset_nbt );

                                            localPalette.put( i , data.value.name.value, data.value.val.value );

                                            // console.log( localPalette.get( i ) );

                                            _offset = _offset + _offset_nbt;


                                        } );
                                    };
                                };
                            };

                            var index_AfterPalette = _offset;
                            _offset_new            = index_blocks;

                            var position = 0;

                            for( wordi = 0; wordi < wordCount; wordi++ )
                            {
                                var word = value.readUInt32LE( _offset_new ); _offset_new = _offset_new + 4;

                                for( block = 0; block < blocksPerWord; block++ )
                                {
                                    var state = ( word >> (( position % blocksPerWord ) * bitsPerBlock )) & (( 1 << bitsPerBlock ) - 1 );
                                    var x     = ( position >> 8 ) & 0xF;
                                    var y     =   position        & 0xF;
                                    var z     = ( position >> 4 ) & 0xF;

                                    // console.log( 'State:\t' + state + '\tX:\t' + x + '\tY:\t' + y + '\tZ:\t' + z );

                                    // console.log( localPalette.get( state ).name );
                                    try
                                    {
                                        chunk.setBlockType( new Vec3( x, y + SubChunkYOffset, z ), localPalette.get( state ).name )
                                    } catch ( err ) {

                                    };

                                    position++;
                                }
                            }
                        };


                    break;
                };
            };
            
        } );

        return chunk;
    } catch ( err ) {
        // console.log( 'Key not readable with current options.' );
        return null;
    };
};


module.exports = readChunk;