const db          = require( '../app.js' ).db;
const Chunk       = require( '../app.js' ).Chunk;
const SmartBuffer = require( '../app.js' ).SmartBuffer;
const nbt         = require( '../app.js' ).nbt;
const colors      = require( '../app.js' ).colors;

var readChunk = function( key ) {
    try {
        db.get( Buffer.from( key ), function( err, value ) {

            if ( err )
            {
                console.log( colors.red( '[READ ERROR]' ) + ' Skiping... ' + err );
            } else {

                var _offset = 0;
                var SubChunkVersion = value.readInt8( _offset ); _offset++;

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
                            
                            var blockIndex = _offset;
                            _offset        = _offset + ( wordCount * 4 );

                            if ( isRuntime )
                            {
                                // NUMBER SERIALIZER
                                /*
                                    Is this even necessary for saved worlds?
                                */
                            } else {
                                // NBT TAG SERIALIZER
                                if ( _offset < value.length ) // Strange bug where _offset is higher than value size
                                {

                                    var PalletteSize = value.readInt32LE( _offset ); _offset += 4;
                                    console.log( 'Palette size:\t' + PalletteSize + '\tentries.' );

                                    var Pallette_Persistance = require( '../pallettes/pallette_persistance.js' );

                                    var localPallette = new Pallette_Persistance;

                                    // localPallette.put( 1, 'test', '123' );

                                    // console.log( localPallette );

                                    // console.log( PalletteSize );

                                    // console.log( value.slice( _offset ).toString( 'utf8' ) );

                                    // console.log( deserializeNBTUncompressed( value.slice( _offset ) ) );

                                    /*
                                    function deserializeNBTUncompressed ( buffer_nbt )
                                    {

                                    };
                                    */

                                    /*
                                    for( i = 0; i < 1; i++ )
                                    {
                                        nbt.parseUncompressed( value.slice( _offset ), true, function( err, tag ) {
                                            console.log( tag );
                                        } );
                                    };
                                    */
                                };

                                // console.log( 'Pallette Start:\n' + buff.toString() + '\n' );

                                // console.log( nbt.parse( localPallette ) );

                            };

                            /*
                            for( wordi = 0; wordi < wordCount; wordi++ )
                            {
                                word = buff.readIntLE();
                            };
                            */
                        };


                    break;
                };
            };
            
        } );
    } catch ( err ) {
        // console.log( 'Key not readable with current options.' );
        return null;
    };
};


module.exports = readChunk;