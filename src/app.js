var readline = require( 'readline' );
var colors   = require( 'colors' );

const app_name    = 'Papyrus';
const app_author  = 'clarkx86';
const app_version = [ '0.1', 'a' ];

console.log( colors.bold( app_name  + ' v' + app_version[0] + app_version[1] ) + colors.reset( ' by ' ) + colors.rainbow( app_author ) );

// console.log( 'Checking for updates...' );

console.log( 'Loading libraries...' );

var i = 0;
var string_libraries;
var level    = require( 'level' ); i++;
// var zlib  = require( 'zlib' ); i++;

if ( i == 1 )
{
    string_libraries = 'library';
} else {
    string_libraries = 'libraries';
};

console.log( colors.green( 'Successfully' ) + colors.reset( ' loaded ' + i + ' ' + string_libraries + '.' ) );
console.log( 'Type "help" to get started.');