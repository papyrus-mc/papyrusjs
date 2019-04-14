const json_package = require( '../package.json' );
const yargs        = require( 'yargs' );
const fs           = require( 'fs' );
const path         = require( 'path' );
const readline     = require( 'readline' );
const colors       = require( 'colors' );
const Spinner      = require( 'cli-spinner' ).Spinner;
const marky        = require( 'marky' );

yargs.parse();

var rl = readline.createInterface( process.stdin, process.stdout );

console.log( colors.bold( json_package.name.charAt( 0 )/*.toUpperCase()*/ + json_package.name.slice( 1, json_package.name.length - 2 ) + '.' + json_package.name.slice( json_package.name.length - 2 ) + ' v' + json_package.version + json_package.version_devstate.charAt( 0 ) ) + colors.reset( ' by ' ) + json_package.author );
yargs.version( json_package.version + json_package.version_devstate.charAt( 0 ) );

// Require more libraries
var spinner = new Spinner();
spinner.setSpinnerString( 0 );

spinner.setSpinnerTitle( 'Loading libraries... %s' );
spinner.start();

var libraries_loaded = 0;
let string_libraries;

const levelup           = require( 'levelup' );                      libraries_loaded++;
const Jimp              = require( 'jimp' );                         libraries_loaded++;
const Chunk             = require( './palettes/chunk.js' );
const nbt               = require( 'prismarine-nbt' );               libraries_loaded++;
const Vec3              = require( 'vec3' );                         libraries_loaded++;

if ( libraries_loaded == 1 )
{
    string_libraries = 'library';
} else {
    string_libraries = 'libraries';
};

spinner.stop();

console.log( '\n' + colors.green( 'Successfully' ) + colors.reset( ' loaded ' + libraries_loaded + ' ' + string_libraries + '.' ) );
console.log( 'Type "help" to get started.');

rl.prompt();

rl.on( 'line', function( str_in ) {

    // COMMAND: help
    if        ( str_in == 'help' )
    {
        console.log( '\nExample usage:')
        console.log( '-path "MyWorld" --mode=papyrus\n' )
        console.log( 'Command list:\n   help: Displays help\n   exit: Closes ' + json_package.name.charAt( 0 ).toUpperCase() + json_package.name.slice( 1 ) + '\n\nParameters:\n   --path: Path to your world save\n   --output: Output directory for rendered Map\n   --mode: "papyrus" or "vanilla" (all chunks or ingame maps only)\n   --textures: Path to .mcpack folder containing the textures' );
    // COMMAND: exit
    } else if ( str_in == 'exit' )
    {
        console.log( 'Exiting...' );
        process.exit();
    } else
    // COMMAND: everything else
    {
        init( str_in );
    };
} );

function init( path_world ) {
    var path_leveldat = path.normalize( path_world + '/level.dat' );
    if ( fs.existsSync( path_leveldat ) != 1 )
    {
        app_error( 'Invalid path. No "level.dat" found.' );
    } else {

        const db = levelup( new ( require( './leveldb-mcpe_ZlibRaw.js' ) )( path.normalize( path_world + '/db/' ) ) );

        console.log( 'Reading database. This can take a couple of seconds up to a couple of minutes.' );

        var db_keys           = [],
            db_keys_subchunks = [],
            chunkX_max        = [],
            chunkZ_max        = [],
            SAFE_MAX          = 65535;

        chunkX_max[ 0 ] = 0;
        chunkX_max[ 1 ] = 0;
        chunkZ_max[ 0 ] = 0;
        chunkZ_max[ 1 ] = 0;

        db.createKeyStream()
            .on( 'data' , function( data ) {

                db_keys.push( data );

                var key = new Buffer.from( data );

                if ( key.length >= 8 ) // only read SubChunk Keys
                {
                var key_chunkX = key.readInt32LE( 0 )
                    key_chunkZ = key.readInt32LE( 4 )

                if        ( key_chunkX < chunkX_max[ 0 ] )
                {
                    chunkX_max[ 0 ] = key_chunkX;
                } else if ( key_chunkX > chunkX_max[ 1 ] && !( key_chunkX > SAFE_MAX ) )
                {
                    chunkX_max[ 1 ] = key_chunkX;
                };

                if        ( key_chunkZ < chunkZ_max[ 0 ] )
                {
                    chunkZ_max[ 0 ] = key_chunkZ;
                } else if ( key_chunkZ > chunkZ_max[ 1 ] && !( key_chunkZ > SAFE_MAX ) )
                {
                    chunkZ_max[ 1 ] = key_chunkZ;
                };

                // console.log( 'Key:\t' + db_keys.length + '\tBuffer:\t' + key.toString( 'hex' ) + '\tChunk X:\t' + key_chunkX.toString() + '\tChunk Z:\t' + key_chunkZ.toString() );

                // console.log( data );
                };

            } ).on ( 'end', async function() {

                // Validate SubChunk-Keys
                console.log( 'Validating...' );
                for( i = 0; i < db_keys.length; i++ )
                {
                    try {
                        // console.log( db_keys[ i ].length );
                        if ( db_keys[ i ].readInt8( 8 ) == 47 )
                        {
                            db_keys_subchunks.push( db_keys[ i ] );
                        };
                    } catch ( err ) {
                        // Not a valid SubChunk Key
                    };
                };

                console.log( 'Found ' + colors.bold( db_keys.length ) + ' keys, which ' + colors.bold( db_keys_subchunks.length ) + ' of them are valid SubChunks.' );
                console.log( 'Furthest X (negative):\t' + chunkX_max[ 0 ].toString() + '\t Furthest Z (negative):\t' + chunkZ_max[ 0 ].toString() + '\nFurthest X (positive):\t' + chunkX_max[ 1 ].toString() + '\t Furthest Z (positive):\t' + chunkZ_max[ 1 ].toString() );

                // Free up memory
                db_keys  = null;


                // Construct Chunks out of SubChunks & Render each one
                module.exports = { db };
                
                console.log( 'Constructing Chunks...' );
                marky.mark( 'task_construct' );

                var chunkIndex = { };
                const readChunk = require( './db_read/readChunk.js' );
                const trimChunk = require( './db_read/trimChunk.js' );
                const  renderChunk = require( './render/renderChunk' ); 
                const Cache = require( './palettes/textureCache' );
                
                var cache = new Cache();

                await db_keys_subchunks.forEach( async function( key ) {
                    var chunkXZ = key.slice( 0, 8 );

                    // console.log( ( chunkXZ.readInt32LE() ).tostring() + ' ' + ( chunkXZ.readInt32LE() ).toString() );

                    if ( !chunkIndex[ chunkXZ.toString( 'hex' ) ] )
                    {
                        // console.log( 'Chunk array for\tX:\t' + chunkXZ.readInt32LE( 0 ) + '\tZ:\t' + chunkXZ.readInt32LE( 4 ) + '\tdoes not exist.' );
                        chunkIndex[ chunkXZ.toString( 'hex' ) ] = new Chunk( chunkXZ );
                    };

                    await readChunk( Buffer.from( key ), chunkIndex[ chunkXZ.toString( 'hex' ) ] );
                    // console.log( 'next' );
                } );

                console.log( 'Trimming Chunks...' )
                var transparentBlocks  = JSON.parse( fs.readFileSync( './lookup_tables/transparent-blocks_table.json'  ) );
                var missingDefinitions = JSON.parse( fs.readFileSync( './lookup_tables/missing-definitions_table.json' ) );

                const missingDefinition = require( './palettes/missingDefinitions' );
                var mdcache = new missingDefinition();

                Object.keys( chunkIndex ).forEach( function( key ) {

                    var chunkXZ = chunkIndex[ key ].getXZ();
                    chunkIndex[ key ] = trimChunk( chunkIndex[ key ], chunkXZ, transparentBlocks );
                    renderChunk( chunkIndex[ key ], cache, 16, missingDefinitions, mdcache );

                    // Free up memory
                    chunkIndex[ key ] = null;
                } );

                // Close database
                db.close( function( err ) {
                    if ( !err ) {
                        console.log( 'Closed database.' );
                    };

                    // db = null
                } );

                // await???
                var time_entry = await marky.stop( 'task_construct' );
                await console.log( 'Done.' );

                // console.log( chunkIndex[ db_keys_subchunks[ 0 ].slice( 0, 8 ).toString( 'hex' ) ].list() );
                
                await console.log( 'Constructed ' + Object.keys( chunkIndex ).length + ' Chunks in ' + Math.floor( time_entry.duration * 0.001 ) + ' seconds.' );

            } );
    };
};

function app_error( err ) {
    console.log( colors.red.bold( 'AN ERROR OCCURED:\n' ) + colors.reset( err ) );
};