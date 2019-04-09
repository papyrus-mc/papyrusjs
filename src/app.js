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

console.log( colors.bold( json_package.name.charAt( 0 ).toUpperCase() + json_package.name.slice( 1 ) + ' v' + json_package.version + json_package.version_devstate.charAt( 0 ) ) + colors.reset( ' by ' ) + json_package.author );
yargs.version( json_package.version + json_package.version_devstate.charAt( 0 ) );

// Require more libraries
var spinner = new Spinner();
spinner.setSpinnerString( 0 );

spinner.setSpinnerTitle( 'Loading libraries... %s' );
spinner.start();

var libraries_loaded = 0;
let string_libraries;

const { Database }      = require( 'bindings' )( 'node_leveldb_mcpe_native.node' );
const levelup           = require( 'levelup' );                      libraries_loaded++;
const Jimp              = require( 'jimp' );                         libraries_loaded++;
const Chunk             = require( 'prismarine-chunk' )( 'pe_1.0' ); libraries_loaded++;
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
        renderStart( str_in );
    };
} );

async function renderStart( path_world ) {
    var path_leveldat = path.normalize( path_world + '/level.dat' );
    if ( fs.existsSync( path_leveldat ) != 1 )
    {
        app_error( 'Invalid path. No "level.dat" found.' );
    } else {

        const db = levelup( new ( require( '../' ) )( path.normalize( path_world + '/db/' ) ) );

        console.log( 'Reading database. This can take a couple of seconds up to a couple of minutes.' );

        var db_keys = [];

        db.createKeyStream()
            .on( 'data' , function( data ) {

                db_keys.push( data );
                // console.log( db_keys.length + '\r' );

            } ).on ( 'end', function() {

                console.log( 'Found ' + db_keys.length + ' keys.' );

                module.exports = { db, Chunk };

                const readChunk = require( './db_read/readChunk.js' );
       
                for ( i = 0; i < 10 /*db_keys.length */; i++ ) {
                    readChunk( db_keys[ i ] );
                };

               // readChunk( db_keys[ 1234 ] );

            } );

        console.log( 'Done.' );

        // DEBUG

        var debug_dir_temp = './dev/temp/',
            debug_dir_out  = './dev/out/',
            debug_path_rp  = './dev/Vanilla_Resource_Pack_1.10.0/';

        var path_textures = path.normalize( /* argv.textures + */ '/textures/blocks/' ),
            ext_textures  = '.png';

        render_current = 0;
        render_total   = 0;

        marky.mark( 'task_render' );

        console.log( 'Initializing render process...' );

        module.exports  = { Jimp, path };
        var renderInit  = require( './render/renderInit'  ).renderInit;
        var renderChunk = require( './render/renderChunk' );
        
        renderInit( path.normalize( debug_path_rp + path_textures ), ext_textures );

        // renderChunk( render_texture_width, render_texture_height, 0, 0, render_current, render_total );

        var time_entry = marky.stop( 'task_render' );
        console.log( colors.green( 'Finished' ) + colors.reset( ' rendering process in ' + ( time_entry.duration*0.001 ).toFixed( 2 ) + ' seconds.' ) );
    };
};

function app_error( err ) {
    console.log( colors.red.bold( 'AN ERROR OCCURED:\n' ) + colors.reset( err ) );
};

module.exports = { app_error }