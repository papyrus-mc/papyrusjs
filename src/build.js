const json_package = require( '../package.json' );
const { exec }     = require( 'child_process' );

var build = exec( 'pkg ' + json_package.main + ' -t node10-linux-x64,node10-win-x64 -v ' + json_package.version + '-o ' + json_package.name + '_' + json_package.version_devstate + json_package.version + ' --out-path ' + '"../bin"' );