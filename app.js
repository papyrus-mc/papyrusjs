const json_package      = require( './package.json' );
const fs                = require( 'fs' );
const path              = require( 'path' );
const colors            = require( 'colors' );
const stripJsonComments = require( 'strip-json-comments' );
const ProgressBar       = require( 'progress' );
const levelup           = require( 'levelup' );
const Chunk             = require( './src/palettes/chunk.js' );
const cluster           = require( 'cluster' );
const os                = require( 'os' );

const argv = require( 'yargs' )
    .version( json_package.version + json_package.version_stage.charAt( 0 ) )
    .option( 'output', {
        alias: 'o',
        default: './output/'
    } )
    .option( 'world', {
        alias: 'w'
    } )
    .option( 'textures', {
        alias: 't',
        default: './textures/'
    } )
    .option( 'threads', {
        default: os.cpus().length
    } )
    .option( 'mode', {
        alias: 'm'
    } )
    .option( 'force-download', {
        default: false,
        type: 'boolean'
    } )
    .option( 'verbose', {
        alias: 'v',
        default: false,
        type: 'boolean'
    } )
    .demandOption( [ 'world', 'textures', 'output' ] )
    .argv

// Download textures if textures can't be found
// DOWNLOADING TEXTURES SHOULD BE SYNCHRONOUS IF POSSIBLE, SO THE LOOKUP-TABLES BELOW GET REQUIRED WHEN ALL FILES ARE PRESENT

if ( ( argv[ 'force-download' ] == true ) || ( !fs.existsSync( path.normalize( argv.textures + 'blocks.json' ) ) ) ) {
    console.log( 'Textures (or some required files) missing. Downloading...' );
    require( './src/downloadTextures.js' )( path.normalize ( argv.textures ) )
};

var transparentBlocks = require( './src/lookup_tables/transparent-blocks_table.json'  ),
    runtimeIDTable    = require( './src/lookup_tables/runtimeid_table.json' ),
    monoTable         = require( './src/lookup_tables/monochrome-textures_table.json' ),
    patchTable        = require( './src/lookup_tables/patch-textures_table.json' ),
    textureTable      = JSON.parse( stripJsonComments( fs.readFileSync( path.normalize( argv.textures + '/textures/terrain_texture.json' ) ).toString() ) ),
    blockTable        = JSON.parse( stripJsonComments( fs.readFileSync( path.normalize( argv.textures + 'blocks.json' ) ).toString() ) );

var path_output = path.normalize( argv.output ),
    path_resourcepack = path.normalize( argv.textures ),
    zoomLevelMax = process.env[ 'zoomLevelMax' ],
    renderMode = argv.mode;

module.exports = { renderMode, transparentBlocks, runtimeIDTable, monoTable, patchTable, textureTable, blockTable, path_output, path_resourcepack };

if ( cluster.isMaster ) {

console.log( colors.bold( json_package.name.charAt( 0 ) + json_package.name.slice( 1, json_package.name.length - 2 ) + '.' + json_package.name.slice( json_package.name.length - 2 ) + ' v' + json_package.version + json_package.version_stage.charAt( 0 ) ) + colors.reset( ' by ' ) + json_package.author );

if ( argv.verbose == true ) {
    console.log( colors.bold( 'Verbose mode' ) + ' is on! You will see debug console output.' );
};

if ( argv.output == './output/' ) {
    console.log( colors.yellow( '[WARNING]' ) + ' No output path specified. The default path "./output/" will be used.' );
}
if ( argv.output == './textures/') {
    console.log( colors.yellow( '[WARNING]' ) + ' No texture path specified. The default path "./textures/" will be used.' );
}

console.log( 'Threads: ' + argv.threads );

// Check for latest version
require( './src/updateCheck.js' )();

// Run
// init( path.normalize( argv.world ), path.normalize( argv.output ) );

function init( path_world, path_output ) {
    var path_leveldat = path.normalize( path_world + '/level.dat' );
    if ( fs.existsSync( path_leveldat ) != 1 )
    {
        console.log( colors.red.bold( '[ERROR]' ) + ' Invalid world path. No "level.dat" found.' );
    } else {

        const db = levelup( new ( require( 'leveldb-mcpe' ) )( path.normalize( path_world + '/db/' ) ) );

        console.log( 'Reading database. This can take a couple of seconds up to a couple of minutes.' );

        var db_keys = { },
            chunksTotal = [ ];

            chunksTotal[ 0 ] = 0; // SubChunks

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

                if ( argv.verbose ) { console.log( 'Allocated ' + Math.round( ( process.memoryUsage().heapUsed/Math.pow( 1024, 2 ) ) ) + ' MB of memory when iterating through the database.' ); };

                var chunkX = [ ],
                    chunkZ = [ ];

                chunkX[ 0 ] = 0;    // Negative X
                chunkX[ 1 ] = 0;    // Positive X
                chunkZ[ 0 ] = 0;    // Negative Z
                chunkZ[ 1 ] = 0;    // Positive Z

                // Count chunks
                Object.keys( db_keys ).forEach( function( key ) {
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

                // Prepare output directory
                prepareOutput();

                console.log( 'Furthest X (negative):\t' + chunkX[ 0 ] + '\tFurthest X (positive):\t' + chunkX[ 1 ] + '\nFurthest Z (negative):\t' + chunkZ[ 0 ] + '\tFurthest Z (positive):\t' + chunkZ[ 1 ] );
                console.log( 'Processing and rendering ' + colors.bold( Object.keys( db_keys ).length ) + ' Chunks, which ' + colors.bold( chunksTotal[ 0 ] ) + ' of them are valid SubChunks...' );
                
                //var bar = new ProgressBar( colors.bold( '[' ) + ':bar' + colors.bold( ']' ) + ' :percent\tProcessing chunk :current/ :total\t:rate chunks/Second\t(:eta seconds left)', {
                var bar = new ProgressBar( colors.bold( '[' ) + ':bar' + colors.bold( ']' ) + ' :percent\tProcessing chunk :current/ :total\t:rate chunks/Second', {
                    total: Object.keys( db_keys ).length,
                    complete: colors.inverse( '=' ),
                    width: 32
                } );

                var workers = [ ],
                    chunksPerThread = Math.round( Object.keys( db_keys ).length/argv.threads ),
                    start = 0,
                    finishedWorkers = 0;

                for( i = 0; i < argv.threads; i++ ) {
                    var workerArgs = {};
                        workerArgs[ "ID" ] = i;
                        workerArgs[ 'start' ] = start;
                        workerArgs[ 'end' ] = start + chunksPerThread - 1;
                        workerArgs[ 'worldOffset' ] = JSON.stringify( { 'x': chunkX, 'z': chunkZ } ),
                        workerArgs[ "chunksTotal" ] = Object.keys( db_keys ).length;
                        workerArgs[ "zoomLevelMax" ] = zoomLevelMax;

                    workers.push( cluster.fork( workerArgs ) );

                    start += chunksPerThread;
                };

                bar.tick();

                // WORKER EVENT HANDLER
                cluster.on( 'message', ( worker, msg ) => {
                    //console.log( 'Got message from: ' + worker[ 'id' ] );
                    switch( msg[ 'msgid' ] ) {
                        case 0: // Request for key
                            // console.log( msg[ 'msg' ] );

                            try {
                                bar.tick();
                                key = db_keys[ Object.keys( db_keys )[ msg[ 'msg' ] ] ];
                                var key_request,
                                    readPromises = [ ],
                                    db_data = [ ];

                                for( i = 0; i <= key.readInt8( 9 ); i++ )
                                {
                                    key_request = Buffer.alloc( 10 );       // Create new buffer 
                                    key.copy( key_request );                // Copy target SubChunk key to new buffer
                                    key_request.writeInt8( i, 9 );          // Assemble database request key buffer

                                    readPromises.push( new Promise( ( resolve, reject ) => {
                                        db.get( key_request, ( err, data ) => {
                                            db_data.push( data );
                                            resolve();
                                        } );
                                    } ) );
                                };

                                Promise.all( readPromises )
                                    .then( function() {
                                        workers[ worker[ 'id' ]-1 ].send( { msgid: 0, msg: { xz: key.slice( 0, 8 ), data: db_data } } );
                                    } );
                            } catch( err ) {

                            };
                            break;

                        case 1:
                            finishedWorkers++;
                            // if ( argv.verbose ) { console.log( 'Thread ' + ( worker[ 'id' ]-1 ) + ' is done rendering.' ); };
                            if ( finishedWorkers === os.cpus().length ) {
                                if ( argv.verbose ) { console.log( 'All threads are done rendering.' ); };
                                processLeafletMap();
                            };
                            break;
                    };
                } );

                async function processLeafletMap() {
                    // Generate additional zoom levels for Leaflet map
                    const renderZoomLevel = require( './src/render/renderZoomLevel.js' );
                    
                    var progressBars = {
                        zoomLevels: new ProgressBar( colors.bold( '[' ) + ':bar' + colors.bold( ']' ) + ' :percent\tRendering zoom levels\tCurrent zoom level:\t', {
                            total: Object.keys( db_keys ).length,
                            complete: colors.inverse( '=' ),
                            width: 32
                        } )
                    };

                    renderZoomLevel( 16, zoomLevelMax, chunkX, chunkZ )
                        .then( ( ) => {
                            console.log( 'Successfully rendered all zoom levels!' );
                            process.exit();
                        } );
                        
                    
                };
                
                function prepareOutput() {
                    if ( !fs.existsSync( path.normalize( argv.output ) ) ) {
                        fs.mkdirSync( path.normalize( argv.output ))
                    };
                    if ( !fs.existsSync( path.normalize( argv.output ) + '/map/' ) ) {
                        fs.mkdirSync( path.normalize( argv.output ) + '/map/' );
                    };

                    // Create index.html
                    console.log( 'Creating Leaflet map...' );
                    const buildHTML = require( './src/html/buildHTML.js' );
                    buildHTML( path.normalize( argv.output ), 0, zoomLevelMax, 0, 0 );
                };
            } );
    };
};

} else {

    const convert     = require( 'color-convert' );
    const mapnik      = require( 'mapnik' );
    const readChunk   = require( './src/db_read/readChunk.js' );
    const renderChunk = require( './src/render/renderChunk.js' ); 
    const Cache       = require( './src/palettes/textureCache' );

    var pos = process.env[ 'start' ],
        cache = new Cache(),
        worldOffset = JSON.parse( process.env[ 'worldOffset' ] );
    
    initPromises = [ ];
    // Prepare essential images for cache
    // Monochrome textures blending colour
    initPromises.push( new Promise( ( resolve, reject ) => {
        var img   = new mapnik.Image( 16, 16 ),
            color = convert.hex.rgb( '#79c05a' );
        img.fillSync( new mapnik.Color( color[0], color[1], color[2], 255, true ) );
        cache.save( 'mono_default', 0, img );

        var img = new mapnik.Image( 1, 1 );
        cache.save( 'placeholder', 0, img );

        var img = new mapnik.Image( 16, 16 );
        img.fillSync( new mapnik.Color( 255, 255, 255, 255, true ) );
        cache.save( 'blend_white', 0, img );

        var img = new mapnik.Image( 16, 16 );
        img.fillSync( new mapnik.Color( 0, 0, 0, 255, true ) );
        cache.save( 'blend_black', 0, img );

        resolve();
    } ) );
    
    Promise.all( initPromises )
        .then( () => {
            process.send( { msgid: 0, msg: pos } ); // Initial chunk request
        } );
    
    // console.log( "I'm worker " + process.env[ 'ID' ] + ' and I render from ' + process.env[ 'start' ] + ' to ' + process.env[ 'end' ] );

    process.on( 'message', ( msg ) => {
        switch( msg[ 'msgid' ] ) {
            case 0: // Received requested chunk
                var chunk = new Chunk( Buffer.from( msg[ 'msg' ][ 'xz' ] ) );
                // console.log( Buffer.from( msg[ 'msg' ][ 'xz' ] ) );

                for( i = 0; i < msg[ 'msg' ][ 'data' ].length; i++ ) {
                    readChunk( Buffer.from( msg[ 'msg' ][ 'data' ][ i ] ), chunk, i );
                };

                renderChunk( chunk, cache, 16, worldOffset, zoomLevelMax )
                    .then( function() {
                        pos++;

                        if ( pos <= process.env[ 'end' ] ) {
                            process.send( { msgid: 0, msg: pos } );
                        } else {
                            process.send( { msgid: 1, msg: true } ); // Process is done rendering their chunks
                        };
                        
                    } );
                break;
        };
    } );
    
};