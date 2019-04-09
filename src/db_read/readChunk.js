const db    = require( '../app.js' ).db;
const Chunk = require( '../app.js' ).Chunk;

var readChunk = function( key ) {
    try {
        db.get( Buffer.from( key ), function( err, value ) {

            if ( err ) {
                // app_error( err );
                throw err;
            };

            // console.log( value );

            var SubChunkVersion = parseInt( value.slice( 0, 1 ).toString( 'hex' ), 10 );

            switch( SubChunkVersion )
            {
                case 0:
                    // valid, goto next
                case 1:
                    // valid, goto next
                case 8:
                    // valid
                    console.log( 'SubChunk Version:\t' + SubChunkVersion.toString() );
                    break;
            };
            
        } );
    } catch ( err ) {
        console.error( err );
    };
};


module.exports = readChunk;