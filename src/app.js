const json_package = require( '../package.json' );
const yargs        = require( 'yargs' );
const fs           = require( 'fs' );
const path         = require( 'path' );
const readline     = require( 'readline' );
const colors       = require( 'colors' );
const Spinner      = require( 'cli-spinner' ).Spinner;
const marky        = require( 'marky' );
const stripJsonComments = require( 'strip-json-comments' );
const http         = require( 'http' );

const levelup = require( 'levelup' );
const Chunk   = require( './palettes/chunk.js' );

yargs.parse();

var rl = readline.createInterface( process.stdin, process.stdout );

console.log( colors.bold( json_package.name.charAt( 0 )/*.toUpperCase()*/ + json_package.name.slice( 1, json_package.name.length - 2 ) + '.' + json_package.name.slice( json_package.name.length - 2 ) + ' v' + json_package.version + json_package.version_devstate.charAt( 0 ) ) + colors.reset( ' by ' ) + json_package.author );
yargs.version( json_package.version + json_package.version_devstate.charAt( 0 ) );

// Check for latest version
http.get( 'http://papyrus.clarkx86.com/', ( err, ver ) => {
    if ( err ) {
        console.log( 'Could not check for updates...' );
    } else {
        console.log( 'Latest version: ' + ver );
    };
} );

console.log( 'Type "help" to get started.');

rl.prompt();
rl.on( 'line', function( str_in ) {
    init( str_in );
} );

function init( path_world ) {
    var path_leveldat = path.normalize( path_world + '/level.dat' );
    if ( fs.existsSync( path_leveldat ) != 1 )
    {
        app_error( 'Invalid path. No "level.dat" found.' );
    } else {

        const db = levelup( new ( require( './leveldb-mcpe_ZlibRaw.js' ) )( path.normalize( path_world + '/db/' ) ) );

        console.log( 'Reading database. This can take a couple of seconds up to a couple of minutes.' );

        var db_keys = { },
            chunksTotal = [ ];

            chunksTotal[ 0 ] = 0; // SubChunks
            chunksTotal[ 1 ] = 0; // Full chunks

        db.createKeyStream()
            .on( 'data' , function( data ) {

                try {
                    if ( data.readInt8( 8 ) == 47 ) {       // Only read keys that are specificly SubChunks
                        db_keys[ data.slice( 0, 8 ).toString( 'hex' ) ] = data;
                        chunksTotal[ 0 ]++;
                    };
                } catch( err ) {

                };

            } ).on ( 'end', function() {

                var chunkX = [ ],
                    chunkZ = [ ];

                chunkX[ 0 ] = 0;    // Negative X
                chunkX[ 1 ] = 0;    // Positive X
                chunkZ[ 0 ] = 0;    // Negative Z
                chunkZ[ 1 ] = 0;    // Positive Z

                // Count chunks
                Object.keys( db_keys ).forEach( function( key ) {
                    // Count total full Chunks
                    chunksTotal[ 1 ]++;

                    // Update XZ-Distance
                    if ( db_keys[ key ].readInt32LE( 0 ) <= chunkX[ 0 ] ) { chunkX[ 0 ] = db_keys[ key ].readInt32LE( 0 ) };
                    if ( db_keys[ key ].readInt32LE( 0 ) >= chunkX[ 1 ] ) { chunkX[ 1 ] = db_keys[ key ].readInt32LE( 0 ) };
                    if ( db_keys[ key ].readInt32LE( 4 ) <= chunkZ[ 0 ] ) { chunkZ[ 0 ] = db_keys[ key ].readInt32LE( 4 ) };
                    if ( db_keys[ key ].readInt32LE( 4 ) >= chunkZ[ 1 ] ) { chunkZ[ 1 ] = db_keys[ key ].readInt32LE( 4 ) };
                } );
                
                var zoomLevelMax = null;

                if ( ( chunkX[ 1 ] - chunkX[ 0 ] ) >= ( chunkZ[ 1 ] - chunkZ[ 0 ] ) ) {
                    console.log( 'X is bigger: ' + ( chunkX[ 1 ] - chunkX[ 0 ] ) + 1 );
                    zoomLevelMax = Math.round( Math.log2( ( chunkX[ 1 ] - chunkX[ 0 ] ) ) );
                } else {
                    console.log( 'Z is bigger: ' + ( chunkZ[ 1 ] - chunkZ[ 0 ] ) );
                    zoomLevelMax = Math.round( Math.log2( ( chunkZ[ 1 ] - chunkZ[ 0 ] ) + 1 ) );
                };

                // Calculate leaflet
                console.log( 'Max zoom level:\t' + zoomLevelMax );

                console.log( 'Furthest X (negative):\t' + chunkX[ 0 ] + '\tFurthest X (positive):\t' + chunkX[ 1 ] + '\nFurthest Z (negative):\t' + chunkZ[ 0 ] + '\tFurthest Z (positive):\t' + chunkZ[ 1 ] );

                console.log( 'Processing and rendering ' + colors.bold( chunksTotal[ 1 ] ) + ' Chunks, which ' + colors.bold( chunksTotal[ 0 ] ) + ' of them are valid SubChunks...' );

                var transparentBlocks = JSON.parse( fs.readFileSync( './lookup_tables/transparent-blocks_table.json'  ) );
                var monoTable         = JSON.parse( fs.readFileSync( './lookup_tables/monochrome-textures_table.json' ) );
                var patchTable        = JSON.parse( fs.readFileSync( './lookup_tables/patch-textures_table.json' ) );
                var textureTable      = JSON.parse( stripJsonComments( fs.readFileSync( './dev/rp/textures/terrain_texture.json' ).toString() ) );
                var blockTable        = JSON.parse( stripJsonComments( fs.readFileSync( './dev/rp/blocks.json' ).toString() ) );

                module.exports = { db, transparentBlocks, monoTable, patchTable, textureTable, blockTable, zoomLevelMax };

                const readChunk   = require( './db_read/readChunk.js' );
                const trimChunk   = require( './db_read/trimChunk.js' );
                const renderChunk = require( './render/renderChunk' ); 
                const Cache       = require( './palettes/textureCache' );

                var chunk;

                var next = 0;

                var cache = new Cache();

                // var c = 31;

                

                processChunk( next );

                async function processChunk( c ) {
                    if ( c < chunksTotal[ 1 ] ) {
                // Object.keys( db_keys ).slice( 0, 10 ).forEach( function( key ) {

                        key = db_keys[ Object.keys( db_keys )[ c ] ];
                        // key = db_keys[ key ];

                        chunk = new Chunk( key );
                        // Create new chunk with coordinates

                        // console.log( key );

                        var key_request;

                        var readPromises = [ ];

                        for( i = 0; i <= key.readInt8( 9 ); i++ )
                        {
                            key_request = Buffer.alloc( 10 );       // Create new buffer 
                            key.copy( key_request );                // Copy target SubChunk key to new buffer
                            key_request.writeInt8( i, 9 );          // Assemble database request key buffer
                            // console.log( db_keys[ key ] );
                            readPromises.push( readChunk( key_request, chunk ) );
                        };

                        Promise.all( readPromises )
                            .then( function() {
                                console.log( 'Done reading chunk:\t' + key.toString( 'hex' ) );
                                chunk = trimChunk( chunk, transparentBlocks );
                                // console.log( chunk.list() );
                            
                                renderChunk( chunk, cache, 16 )
                                    .then( function() {
                                    next++;
                                    processChunk( next );
                                    console.log( 'Rendered! Next...\n' );

                                    if ( c == chunksTotal[ 1 ] ) {
                                        processLeafletMap();
                                    };
                                    } );
                            
                            } );
                    };
                };

                
                
                
                // processLeafletMap();

                async function processLeafletMap() {

                    module.exports = { chunkX, chunkZ, zoomLevelMax };

                    // Generate additional zoom levels for Leaflet map
                    const renderZoomLevel = require( './render/renderZoomLevel.js' );

                    for( j = ( zoomLevelMax - 1 ); j >= 0; j-- ) {
                        await renderZoomLevel( j, 16 );
                    };

                    console.log( 'Done rendering all zoom levels!' );

                    /*
                    ( function() {
                        console.log( 'Creating Leaflet map...' );

                        const buildHTML = require( './html/buildHTML.js' );

                        // buildHTML( './dev/render/leafletOut/', 0, zoomLevelMax, 0, 0 );


                    } )();
                    */
                };

                
                
            } );
    };
};

function app_error( err ) {
    console.log( colors.red.bold( 'AN ERROR OCCURED:\n' ) + colors.reset( err ) );
};