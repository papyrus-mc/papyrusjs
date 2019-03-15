const json_package = require( '../package.json' );
const { exec }     = require( 'child_process' );
const path         = require( 'path' );

var targets = 'node10-linux-x64,node10-win-x64';

console.log( 'Building...' );

var build = exec( 'pkg ' + json_package.main + ' --targets ' + targets + /*' --version ' + json_package.version + */ ' --output "' + path.normalize( path.join( __dirname, '../bin/' + json_package.name + '_' + json_package.version_devstate + json_package.version ) ) + '"', function( err, stdout, stderr ) {

    if ( err )
    {
        console.error( err );
        return;
    };

    console.log( stdout );
} );