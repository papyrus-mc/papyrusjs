const path    = require( 'path' );
const Jimp    = require( 'jimp' );
const fs      = require( 'fs' );
const colors  = require( 'colors' );

var chunkX = require( '../app.js' ).chunkX;
    chunkZ = require( '../app.js' ).chunkZ;

module.exports = function( zoomLevel, chunkSize ) {
    return new Promise( async function( resolve, reject ) {

        console.log( 'X from\t' + chunkX[ 0 ] + '\tto\t' + chunkX[ 1 ] + '\nZ from\t' + chunkZ[ 0 ] + '\tto\t' + chunkZ[ 1 ] );

        console.log( 'Rendering zoom level ' + colors.bold( zoomLevel ) );

        var tiles = Math.pow( 2, zoomLevel );

        console.log( 'Tiles per side:\t' + tiles );

        var tile = new Jimp( chunkSize*chunkSize, chunkSize*chunkSize );

        var outPath = './dev/render/leaflet/map/';

        for( ix = chunkX[ 0 ]; ix < ( Math.ceil( chunkX[ 1 ] ) ); ix++ ) {
            for( iz = chunkZ[ 0 ]; iz < ( Math.ceil( chunkZ[ 1 ] ) ); iz++ ) {
                var tile = new Jimp( ( chunkSize*chunkSize ) * 2, ( chunkSize*chunkSize ) * 2 );

                // Upper left
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( ix*2 ) + '/' + ( iz*2 ) + '.png' ), 0, 0, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Down left
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( ix*2 ) + '/' + ( ( iz*2 )+1 ) + '.png' ), 0, 256, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Upper right
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( ( ix*2 ) + 1 ) + '/' + ( iz*2 ) + '.png' ), 256, 0, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Down right
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( ( ix*2 ) + 1 ) + '/' + ( ( iz*2 ) + 1 ) + '.png' ), 256, 256, ( err, image ) => {
                            tile = image;
                    } );
                } catch( err ) {  };

                tile.resize( 256, 256 );
                tile.write( outPath + ( zoomLevel ) + '/' + ix + '/' + iz + '.png' );
            };
        };

        /*

        // South-West
        for( ix = 0; ix > ( Math.floor( chunkX[ 0 ]/2 ) ); ix-- ) {
            for( iz = -1; iz > ( Math.floor( chunkZ[ 0 ]/2 ) ); iz-- ) {
                var tile = new Jimp( ( chunkSize*chunkSize ) * 2, ( chunkSize*chunkSize ) * 2 );

                // Upper left
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( ix*2 ) + '/' + ( iz*2 ) + '.png' ), 0, 0, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Down left
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( ix*2 ) + '/' + ( ( iz*2 )+1 ) + '.png' ), 0, 256, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Upper right
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( ( ix*2 )+1 ) + '/' + ( iz*2 ) + '.png' ), 256, 0, ( err, image ) => {
                        tile = image;
                    } );
                } catch( err ) {  };
                // Down right
                try {
                    tile.composite( await Jimp.read( outPath + ( zoomLevel+1 ) + '/' + ( (ix*2)+1 ) + '/' + ( ( iz*2 ) + 1 ) + '.png' ), 256, 256, ( err, image ) => {
                            tile = image;
                    } );
                } catch( err ) {  };

                tile.resize( 256, 256 );
                tile.write( outPath + ( zoomLevel ) + '/' + ix + '/' + iz + '.png' );
            };
        };

        */

        // Create 2D-Arrays
        function create2DArray() {
            var arr = [];
            
            for( i = 0; i <= tiles; i++ ) {
                arr[ i ] = new Array();
                for( ii = 0; ii <= tiles; ii++ ) {
                    arr[ i ][ ii ] = undefined;
                };
            };
            return arr;
        };

        var arrSE = create2DArray();
        var arrNE = create2DArray();
        var arrSW = create2DArray();
        var arrNW = create2DArray();

        // South-East
        for( ix = 0; ix <= tiles; ix++ ) {
            for( iz = 0; iz <= tiles; iz++ ) {
                var tilePath = ( outPath + ( zoomLevel + 1 ) + '/' + ix + '/' + iz + '.png' );
                if ( fs.existsSync( tilePath ) ) {
                    arrSE[ ix ][ iz ] = tilePath;
                };
            };
        };

        /*

        // North-East
        for( ix = 0; ix <= tiles; ix++ ) {
            for( iz = 0; iz <= tiles; iz++ ) {
                var tilePath = ( outPath + ( zoomLevel + 1 ) + '/' + ix + '/-' + iz + '.png' );
                if ( fs.existsSync( tilePath ) ) {
                    arrNE[ ix ][ iz ] = tilePath;
                };
            };
        };

        // South-West
        for( ix = 0; ix <= tiles; ix++ ) {
            for( iz = 0; iz <= tiles; iz++ ) {
                var tilePath = ( outPath + ( zoomLevel + 1 ) + '/-' + ix + '/' + iz + '.png' );
                if ( fs.existsSync( tilePath ) ) {
                    arrSW[ ix ][ iz ] = tilePath;
                };
            };
        };

        // North-West
        for( ix = 1; ix <= tiles; ix++ ) {
            for( iz = 1; iz <= tiles; iz++ ) {
                var tilePath = ( outPath + ( zoomLevel + 1 ) + '/-' + ix + '/-' + iz + '.png' );
                if ( fs.existsSync( tilePath ) ) {
                    arrNW[ ix ][ iz ] = tilePath;
                };
            };
        };

        */

            for( ix = 0; ix < tiles; ix++ ) {
                // South-East
                for( iz = 0; iz < tiles; iz++ ) {
                    
                };
            };

        resolve();
    } );
};