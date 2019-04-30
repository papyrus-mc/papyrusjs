const json_package      = require( '../package.json' );
const colors            = require( 'colors' );
const fetch             = require( 'node-fetch' );

module.exports = function() {
    return fetch( 'http://api.github.com/repos/clarkx86/papyrusjs/releases' )
    .then( ( response ) => {
        return response.json();
    } )
    .then( ( json ) => {
        
        var remoteVersion     = json[ 0 ][ 'tag_name' ].slice( 1, json[ 0 ][ 'tag_name' ].search( '-' ) ).replace( '.', '' ).replace( '.', '' );
            remoteStage = json[ 0 ][ 'tag_name' ].slice( json[ 0 ][ 'tag_name' ].search( '-' ) + 1 ),
            localStage        = json_package.version_stage;

        switch( remoteStage ) {
            case 'alpha':
                remoteStage = 0;
                break;

            case 'beta':
                remoteStage = 1;
                break;

            case 'release':
                remoteStage = 2;
                break;
        };

        switch( localStage ) {
            case 'alpha':
                localStage = 0;
                break;

            case 'beta':
                localStage = 1;
                break;

            case 'release':
                localStage = 2;
                break;
        };
        
        if ( ( remoteStage > localStage ) || ( remoteVersion > ( json_package.version.replace( '.', '' ).replace( '.', '' ) ) ) ) {
            console.log( '\n' + colors.inverse( colors.green( 'New update available!' ) ) + '\nRelease ' + json[ 0 ][ 'tag_name' ] + ' is available. You have v' + json_package.version + '-' + json_package.version_stage + '. Get it here: https://github.com/clarkx86/papyrusjs/releases' + '\n' );
        };
    } )
    .catch( ( err ) => {
        console.log( 'Could not check for updates...' );
    } );
};