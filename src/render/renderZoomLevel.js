const blend  = require( '@mapbox/blend' );
const colors = require( 'colors' );
const sharp  = require( 'sharp' );
const fs     = require( 'fs' );
const path   = require( 'path' );

const path_output = require( '../app.js' ).path_output;

module.exports = function( chunkSize, zoomLevelMax, chunkX, chunkZ ) {
    return new Promise( async function ( resolve, reject ) {

        var blendArray = [ ],
            zoomLevelCurrent,
            file,
            tileX = 0,
            tileZ = 0;
            

        // for( ix = Math.floor( chunkX[ 0 ]/2 ); ix < ( Math.ceil( chunkX[ 1 ]/2 ) ); ix++ ) {
        for( zoomLevelCurrent = zoomLevelMax-1; zoomLevelCurrent >= 0; zoomLevelCurrent-- ) {
            console.log( 'Rendering zoom level ' + colors.bold( zoomLevelCurrent ) + ' out of ' + zoomLevelMax );
            divide();
            for( iz = 0; iz < chunkZ[ 1 ] + Math.abs( chunkZ[ 0 ]); iz++ ) {
                for( ix = 0; ix < chunkX[ 1 ] + Math.abs( chunkX[ 0 ] ); ix++ ) { 

                    blendArray = new Array(); // Clear array

                    if ( !fs.existsSync( path_output + '/map/' + ( zoomLevelCurrent ) + '/' ) ) {
                        fs.mkdirSync( path_output + '/map/' + ( zoomLevelCurrent ) + '/' );
                    };

                    file = path.normalize( path_output + '/map/' + ( zoomLevelCurrent+1 ) + '/' + ( ix*2 ) + '/' + ( iz*2 ) + '.png' );
                    if ( fs.existsSync( file ) ) {
                        blendArray.push( {
                            buffer: fs.readFileSync( file ),
                            x: 0,
                            y: 0
                        } );
                    };
                    
                    file = path.normalize( path_output + '/map/' + ( zoomLevelCurrent+1 ) + '/' + ( ix*2 ) + '/' + ( ( iz*2 )+1 ) + '.png' );
                    if ( fs.existsSync( file ) ) {
                        blendArray.push( {
                            buffer: fs.readFileSync( file ),
                            x: 0,
                            y: 256
                        } );
                    };

                    file = path.normalize(  path_output + '/map/' + ( zoomLevelCurrent+1 ) + '/' + ( ( ix*2 )+1 ) + '/' + ( iz*2 ) + '.png' );
                    if ( fs.existsSync( file ) ) {
                        blendArray.push( {
                            buffer: fs.readFileSync( file ),
                            x: 256,
                            y: 0
                        } );
                    };

                    file = path.normalize(  path_output + '/map/' + ( zoomLevelCurrent+1 ) + '/' + ( ( ix*2 )+1 ) + '/' + ( ( iz*2 )+1 ) + '.png' );
                    if ( fs.existsSync( file ) ) {
                        blendArray.push( {
                            buffer: fs.readFileSync( file ),
                            x: 256,
                            y: 256
                        } );
                    };

                    if ( blendArray.length !== 0 ) {
                        await new Promise( ( resolve, reject ) => {
                            blend( blendArray, {
                                width:  Math.pow( chunkSize, 2 )*2,
                                height: Math.pow( chunkSize, 2 )*2
                        }, function( err, buffer ) {
                            sharp( buffer )
                                .resize( Math.pow( chunkSize, 2 ), Math.pow( chunkSize, 2 ) )
                                .png()
                                .toBuffer()
                                .then( ( buffer ) => {
                                    if ( !fs.existsSync( path_output + '/map/' + ( zoomLevelCurrent ) + '/' + ( ix ) + '/' ) ) {
                                        fs.mkdirSync( path_output + '/map/' + ( zoomLevelCurrent ) + '/' + ( ix ) + '/' );
                                    };
                                    fs.writeFileSync( path_output + '/map/' + ( zoomLevelCurrent ) + '/' + ( ix ) + '/' + ( iz ) + '.png', buffer );
                                    // console.log( 'rendered.' );
                                    resolve();
                                } );
                            }
                        ) } );
                    };
                };
            };
        };
        resolve();
    } );

    function divide() {
        chunkX[ 0 ] = chunkX[ 0 ]/2;
        chunkX[ 1 ] = chunkX[ 1 ]/2;
        chunkZ[ 0 ] = chunkZ[ 0 ]/2;
        chunkZ[ 1 ] = chunkZ[ 1 ]/2;
    }
};