const json_package = require( '../package.json' );
const argv         = require( 'yargs' ).argv;
const fs           = require( 'fs' );
const path         = require( 'path' );
const readline     = require( 'readline' );
const colors       = require( 'colors' );

var rl = readline.createInterface( process.stdin, process.stdout );

console.log( colors.bold( json_package.name.charAt( 0 ).toUpperCase() + json_package.name.slice( 1 ) + ' v' + json_package.version + json_package.version_devstate.charAt( 0 ) ) + colors.reset( ' by ' ) + colors.rainbow( json_package.author ) );

// console.log( 'Checking for updates...' );

// Require more libraries
console.log( 'Loading libraries...' );

var i = 0;
var string_libraries;

const PImage = require( 'pureimage' ); i++;
const nbt    = require( 'nbt' );       i++;
const level  = require( 'level' );     i++;
const zlib   = require( 'zlib' );      i++;

if ( i == 1 )
{
    string_libraries = 'library';
} else {
    string_libraries = 'libraries';
};

console.log( colors.green( 'Successfully' ) + colors.reset( ' loaded ' + i + ' ' + string_libraries + '.' ) );
console.log( 'Type "help" to get started.');

rl.prompt();

rl.on( 'line', function( str_in ) {
    if        ( str_in == 'help' )
    {
        console.log( '\nExample usage:')
        console.log( '-path "MyWorld" --mode=papyrus\n' )
        console.log( 'Command list:\n   help: Displays help\n   exit: Closes ' + json_package.name.charAt( 0 ).toUpperCase() + json_package.name.slice( 1 ) + '\n\nParameters:\n   --path: Path to your world save\n   --out: Output directory for rendered Map\n   --mode: "papyrus" or "vanilla" (all chunks or ingame maps only)');
    } else if ( str_in == 'exit' )
    {
        console.log( 'Exiting...' );
        process.exit();
    } else
    {
        var path_leveldat = path.normalize( str_in + '/level.dat.gz' );
        if ( fs.existsSync( path_leveldat ) != 1 )
        {
            app_error( 'Invalid path.' );
        } else {
            var data = fs.readFileSync( path_leveldat );

            console.log( data.toString( 'utf8' ) );

            /*
            var data = zlib.inflateRawSync( data_raw, function( err, data ) {
                if ( err )
                {
                    app_error( err );
                };
            } );
            */

            nbt.parse( data, function( err, data ) {
                if ( err )
                {
                    app_error( err );
                } else {
                    console.log( data );
                };
            } );

            /*
            var db = level( db_path, { createIfMissing: false }, function ( err, db ) {
                if ( err instanceof level.errors.OpenError )
                {
                // FAILED TO OPEN DATABASE
                    app_error( 'Failed to open database. Path:\n' + db_path );
                } else {
                // SUCCESSFULLY OPENED DATABASE
                    console.log( 'Successfully opened database "' + db_path + '"' );

                    db.get( 'dotiledrops', function( err, value ) {

                    if ( err )
                    {
                        app_error( err );
                    } else {
                        console.log( value );
                    };
                } );
                //console.log( colors.red( 'Unknown command "' + str_in + '"') );
                };
            } );
            */

        /*
        if ( db.isOpen() )
        {
            
        } else {
            db.close();
        };
        */
        };
    };
} );

function app_error( err ) {
    console.log( colors.red.bold( 'AN ERROR OCCURED:\n' ) + colors.reset( err ) );
};