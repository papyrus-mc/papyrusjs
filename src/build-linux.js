const json_package = require( '../package.json' );
const { exec }     = require( 'child_process' );
const path         = require( 'path' );

var targets = 'node8-linux-x64';

console.log( 'Building ' + json_package.name.charAt( 0 ).toUpperCase() + json_package.name.slice( 1 ) + ' v' + json_package.version + json_package.version_stage.charAt( 0 ) + ' (Targets: ' + targets + ')...' );

var build = exec( 'pkg ' + json_package.main + ' --targets ' + targets + ' --output "' + path.normalize( path.join( __dirname, '../bin/' + json_package.name + '_' + json_package.version + '-' + json_package.version_stage ) ) + '"', function( err, stdout, stderr ) {
    if ( err )
    {
        console.error( 'Build failed. Error:\n' + err );
        return;
    };

    console.log( stdout );
} );