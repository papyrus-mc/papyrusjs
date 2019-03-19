const json_package = require( '../package.json' );
const argv         = require( 'yargs' ).argv;
const fs           = require( 'fs' );
const path         = require( 'path' );
const readline     = require( 'readline' );
// const glob      = require( 'glob' );
const colors       = require( 'colors' );
const Spinner      = require( 'cli-spinner' ).Spinner;

var rl = readline.createInterface( process.stdin, process.stdout );

console.log( colors.bold( json_package.name.charAt( 0 ).toUpperCase() + json_package.name.slice( 1 ) + ' v' + json_package.version + json_package.version_devstate.charAt( 0 ) ) + colors.reset( ' by ' ) + colors.rainbow( json_package.author ) );

// Require more libraries
var spinner = new Spinner();
spinner.setSpinnerString( 0 );

spinner.setSpinnerTitle( 'Loading libraries... %s' );
spinner.start();

var i = 0;
let string_libraries;

const Chunk   = require( 'prismarine-chunk' )( 'pe_1.0' ); i++;
// const nbt     = require( 'prismarine-nbt' );           i++;
const PImage  = require( 'pureimage' );                    i++;

if ( i == 1 )
{
    string_libraries = 'library';
} else {
    string_libraries = 'libraries';
};

spinner.stop();

console.log( '\n' + colors.green( 'Successfully' ) + colors.reset( ' loaded ' + i + ' ' + string_libraries + '.' ) );
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

function renderStart( path_world ) {
    var path_leveldat = path.normalize( path_world + '/level.dat' );
    if ( fs.existsSync( path_leveldat ) != 1 )
    {
        app_error( 'Invalid path. No "level.dat" found.' );
    } else {
        var data_nbt_leveldat = fs.readFileSync( path_leveldat );

        console.log( 'Attempting to open database...' )

        var db = level( path.normalize( path_world + '/db/' ), { createIfMissing: false }, function( err, db ) {
            if ( err instanceof level.errors.OpenError )
            {
                app_error( err );
            };
            console.log( colors.green( 'Successfully ' ) + colors.reset( 'opened database.' ) );

            db.createReadStream( { keys: true, values: true } )
                .on( 'data', function( data ) {
                    console.log( 'key=', data );
            } );


            var path_textures = path.normalize( argv.textures + '/textures/blocks/' ),
                textures_ext  = '.png';

            const renderChunk = require( 'renderChunk' );

            renderChunk( 16, 16, 0, 0 );
        } );
    };
};

function app_error( err ) {
    console.log( colors.red.bold( 'AN ERROR OCCURED:\n' ) + colors.reset( err ) );
};