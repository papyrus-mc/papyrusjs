const db          = require( '../app.js' ).db;
const Chunk       = require( '../app.js' ).Chunk;
const SmartBuffer = require( '../app.js' ).SmartBuffer;
const nbt         = require( '../app.js' ).nbt;

var readChunk = function( key ) {
    try {
        db.get( Buffer.from( key ), function( err, value ) {

            if ( err )
            {
                // console.log( '[READ ERROR] Invalid request key?' )
            } else {
                var buff = SmartBuffer.fromBuffer( value );

                var SubChunkVersion = /*parseInt( */ buff.readUInt8() /*.toString( 'hex' ), 10 )*/ ;
                var storages = 1;

                switch( SubChunkVersion )
                {
                    case 8:
                        // storages = 
                    case 1:
                        // valid
                        // console.log( 'SubChunk Version:\t' + SubChunkVersion.toString() );
                        // console.log( buff._buff );

                        for( storage = 0; storage < storages; storage++ )
                        {
                            var paletteAndFlag = buff.readUInt8();
                            var isRuntime      = paletteAndFlag & 1 != 0;
                            var bitsPerBlock   = paletteAndFlag >> 1;
                            var blocksPerWord  = Math.floor( 32 / bitsPerBlock );
                            var wordCount      = Math.ceil( 4096.0 / blocksPerWord );

                            console.log( buff._buff );
                            console.log( '\nBuffer:\t' + paletteAndFlag + '\tRuntime:\t' + isRuntime + '\tbits per block:\t' + bitsPerBlock + '\n' );
                            // console.log( bitsPerBlock.toString() );
                            // console.log( 32 * bitsPerBlock );

                            if ( isRuntime )
                            {
                                // NUMBER SERIALIZER
                            } else {
                                // NBT TAG SERIALIZER
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