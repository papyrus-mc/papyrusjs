const path    = require( 'path' );
const Jimp    = require( 'jimp' );
const fs      = require( 'fs' );
const colors  = require( 'colors' );

const path_output = require( '../app.js' ).path_output;

var chunkX = require( '../app.js' ).chunkX;
    chunkZ = require( '../app.js' ).chunkZ;

module.exports = function( zoomLevel, chunkSize ) {
    return new Promise( async function( resolve, reject ) {

        console.log( 'X from\t' + chunkX[ 0 ] + '\tto\t' + chunkX[ 1 ] + '\nZ from\t' + chunkZ[ 0 ] + '\tto\t' + chunkZ[ 1 ] );

        console.log( 'Rendering zoom level ' + colors.bold( zoomLevel ) );

        var tiles = Math.pow( 2, zoomLevel );

        console.log( 'Tiles per side:\t' + tiles );

        chunkX[ 0 ] = Math.floor( chunkX[ 0 ]/2 );
        chunkX[ 1 ] = Math.ceil(  chunkX[ 1 ]/2 );
        chunkZ[ 0 ] = Math.floor( chunkZ[ 0 ]/2 );
        chunkZ[ 1 ] = Math.ceil(  chunkZ[ 1 ]/2 );

        // for( ix = Math.floor( chunkX[ 0 ]/2 ); ix < ( Math.ceil( chunkX[ 1 ]/2 ) ); ix++ ) {
        for( ix = chunkX[ 0 ]; ix < chunkX[ 1 ]; ix++ ) { 
            for( iz = chunkZ[ 0 ]; iz < chunkZ[ 1 ]; iz++ ) {
                var tile = new Jimp( ( chunkSize*chunkSize ) * 2, ( chunkSize*chunkSize ) * 2 );

                // Upper left
                try {
                    tile.composite( await Jimp.read( path_output + '/map/' + ( zoomLevel+1 ) + '/' + ( ix*2 ) + '/' + ( iz*2 ) + '.png' ), 0, 0, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Down left
                try {
                    tile.composite( await Jimp.read( path_output + '/map/' + ( zoomLevel+1 ) + '/' + ( ix*2 ) + '/' + ( ( iz*2 )+1 ) + '.png' ), 0, 256, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Upper right
                try {
                    tile.composite( await Jimp.read( path_output + '/map/' + ( zoomLevel+1 ) + '/' + ( ( ix*2 ) + 1 ) + '/' + ( iz*2 ) + '.png' ), 256, 0, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Down right
                try {
                    tile.composite( await Jimp.read( path_output + '/map/' + ( zoomLevel+1 ) + '/' + ( ( ix*2 ) + 1 ) + '/' + ( ( iz*2 ) + 1 ) + '.png' ), 256, 256, ( err, image ) => {
                            tile = image;
                    } );
                } catch( err ) {  };

                tile.resize( 256, 256 );
                tile.write( path_output + '/map/' + ( zoomLevel ) + '/' + ix + '/' + iz + '.png' );
            };
        };

        resolve();
    } );
};