const json_package      = require( '../package.json' );
const fs                = require( 'fs' );
const path              = require( 'path' );
const colors            = require( 'colors' );
const stripJsonComments = require( 'strip-json-comments' );
const http              = require( 'http' );
const ProgressBar       = require('progress');
const levelup           = require( 'levelup' );
const Chunk             = require( './palettes/chunk.js' );
const cluster           = require( 'cluster' );
const os                = require('os');

const argv = require( 'yargs' )
    .version( json_package.version + json_package.version_devstate.charAt( 0 ) )
    .option( 'output', {
        alias: 'o',
        default: './output/'
    } )
    .option( 'world', {
        alias: 'w'
    } )
    .option( 'textures', {
        alias: 'tp',
    } )
    .option( 'threads', {
        default: os.cpus().length
    } )
    .option( 'mode', {
        default: 'topdown_shaded'
    } )
    .option( 'verbose', {
        alias: 'v',
        default: false
    } )
    .demandOption( [ 'world', 'textures' ] )
    .argv


if ( cluster.isMaster ) {

console.log( colors.bold( json_package.name.charAt( 0 ) + json_package.name.slice( 1, json_package.name.length - 2 ) + '.' + json_package.name.slice( json_package.name.length - 2 ) + ' v' + json_package.version + json_package.version_devstate.charAt( 0 ) ) + colors.reset( ' by ' ) + json_package.author );

// Check for latest version
http.get( 'http://papyrus.clarkx86.com/', ( err, ver ) => {
    if ( err ) {
        console.log( 'Could not check for updates...' );
    } else {
        console.log( 'Latest version: ' + ver );
    };
} );

if ( argv.verbose == true ) {
    console.log( colors.bold( 'Verbose mode' ) + ' is on! You will see debug console output.' );
};

if ( argv.output == './output/' ) {
    console.log( colors.yellow( '[WARNING]' ) + ' No output path specified. The default path "./output/" will be used.' );
}

console.log( 'Threads: ' + argv.threads );

init( path.normalize( argv.world ), path.normalize( argv.output ) );

function init( path_world, path_output ) {
    var path_leveldat = path.normalize( path_world + '/level.dat' );
    if ( fs.existsSync( path_leveldat ) != 1 )
    {
        console.log( colors.red.bold( '[ERROR]' ) + ' Invalid world path. No "level.dat" found.' );
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
                    // console.log( 'X is bigger: ' + ( chunkX[ 1 ] - chunkX[ 0 ] ) + 1 );
                    zoomLevelMax = Math.round( Math.log2( ( chunkX[ 1 ] - chunkX[ 0 ] ) ) );
                } else {
                    // console.log( 'Z is bigger: ' + ( chunkZ[ 1 ] - chunkZ[ 0 ] ) );
                    zoomLevelMax = Math.round( Math.log2( ( chunkZ[ 1 ] - chunkZ[ 0 ] ) + 1 ) );
                };
                // console.log( 'Max zoom level:\t' + zoomLevelMax );

                console.log( 'Furthest X (negative):\t' + chunkX[ 0 ] + '\tFurthest X (positive):\t' + chunkX[ 1 ] + '\nFurthest Z (negative):\t' + chunkZ[ 0 ] + '\tFurthest Z (positive):\t' + chunkZ[ 1 ] );
                console.log( 'Processing and rendering ' + colors.bold( chunksTotal[ 1 ] ) + ' Chunks, which ' + colors.bold( chunksTotal[ 0 ] ) + ' of them are valid SubChunks...' );

                module.exports = { chunksTotal, argv, path_output, path_resourcepack, db, transparentBlocks, monoTable, patchTable, textureTable, blockTable, runtimeIDTable, zoomLevelMax };

                const readChunk   = require( './db_read/readChunk.js' );


                var bar = new ProgressBar( colors.bold( '[' ) + ':bar' + colors.bold( ']' ) + ' Processing chunk :current/ :total\t', {
                    total: Object.keys( db_keys ).length,
                    complete: colors.inverse( '=' ),
                    width: 32
                } );

                var workers = [ ];

                var chunksPerThread = Math.ceil( Object.keys( db_keys ).length/argv.threads );

                var start = 0;

                for( i = 0; i < argv.threads; i++ ) {
                    var workerArgs = {};
                        workerArgs[ "ID" ] = i;
                        workerArgs[ 'start' ] = start;
                        workerArgs[ 'end' ] = start + chunksPerThread - 1;
                        workerArgs[ "chunksTotal" ] = Object.keys( db_keys ).length; // chunksTotal[ 1 ];
                        workerArgs[ "zoomLevelMax" ] = zoomLevelMax;

                    workers.push( cluster.fork( workerArgs ) );

                    start += chunksPerThread;
                };

                // console.log( 'Approx. ' +  + ' chunks per thread.' );

                // WORKER EVENT HANDLER
                cluster.on( 'message', ( worker, msg ) => {
                    //console.log( 'Got message from: ' + worker[ 'id' ] );
                    switch( msg[ 'msgid' ] ) {
                        case 0: // Request for key
                            // console.log( msg[ 'msg' ] );

                            bar.tick();

                            key = db_keys[ Object.keys( db_keys )[ msg[ 'msg' ] ] ];

                            // Create new chunk with coordinates
                            var chunk = new Chunk( key.slice( 0, 8 ) );

                            var key_request,
                                readPromises = [ ];

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
                                    workers[ worker[ 'id' ]-1 ].send( { msgid: 0, msg: { xz: chunk.getXZ(), data: chunk.list() } } );
                                } );
                            break;
                    };
                } );

                async function processLeafletMap() {

                    module.exports = { chunkX, chunkZ, zoomLevelMax, path_output };

                    // Generate additional zoom levels for Leaflet map
                    const renderZoomLevel = require( './render/renderZoomLevel.js' );

                    for( j = ( zoomLevelMax - 1 ); j >= 0; j-- ) {
                        await renderZoomLevel( j, 16 );
                    };

                    console.log( 'Successfully rendered all zoom levels!' );

                    ( function() {
                        console.log( 'Creating Leaflet map...' );
                        const buildHTML = require( './html/buildHTML.js' );
                        buildHTML( path.normalize( argv.output ), 0, zoomLevelMax, 0, 0 );
                    } )();
                };     
            } );
    };
};

} else {
    const trimChunk   = require( './db_read/trimChunk.js' );
    const renderChunk = require( './render/renderChunk' ); 
    const Cache       = require( './palettes/textureCache' );

    var transparentBlocks = JSON.parse( fs.readFileSync( './lookup_tables/transparent-blocks_table.json'  ) );
    var runtimeIDTable    = JSON.parse( fs.readFileSync( './lookup_tables/runtimeid_table.json' ) );
    var monoTable         = JSON.parse( fs.readFileSync( './lookup_tables/monochrome-textures_table.json' ) );
    var patchTable        = JSON.parse( fs.readFileSync( './lookup_tables/patch-textures_table.json' ) );
    var textureTable      = JSON.parse( stripJsonComments( fs.readFileSync( './dev/rp/textures/terrain_texture.json' ).toString() ) );
    var blockTable        = JSON.parse( stripJsonComments( fs.readFileSync( './dev/rp/blocks.json' ).toString() ) );

    var path_output = path.normalize( argv.output ),
        path_resourcepack = path.normalize( argv.textures ),
        zoomLevelMax = process.env[ 'zoomLevelMax' ];

    var chunk,
        next = 0;

    var cache = new Cache();

    var pos = process.env[ 'start' ];

    process.send( { msgid: 0, msg: pos } ); // Initial chunk request
    
    console.log( "I'm worker " + process.env[ 'ID' ] + ' and I render from ' + process.env[ 'start' ] + ' to ' + process.env[ 'end' ] );

    process.on( 'message', ( msg ) => {
        switch( msg[ 'msgid' ] ) {
            case 0: // Received requested chunk
                var chunk = new Chunk( Buffer.from( msg[ 'msg' ][ 'xz' ] ) );
                chunk.load( msg[ 'msg' ][ 'data' ] );
                chunk = trimChunk( chunk, transparentBlocks );
                // renderChunk( chunk, cache, 16 )
                renderChunk( chunk, cache, 16, patchTable, blockTable, textureTable, monoTable, zoomLevelMax, path_resourcepack, path_output )
                    .then( function() {
                        pos++;

                        if ( pos <= process.env[ 'end' ] ) {
                            process.send( { msgid: 0, msg: pos } );
                        };
                        
                    } );
                break;
        };
    } );
};

