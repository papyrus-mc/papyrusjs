const blend   = require( '@mapbox/blend' );
const fs      = require( 'fs' );
const path    = require( 'path' );

const loadTexture = require( './loadTexture.js' );

const path_output       = require( '../app.js' ).path_output;

module.exports = function( Chunk, Cache, size_texture, worldOffset, ZoomLevelMax ) {

    return new Promise( ( resolve, reject ) => {
        var chunk = Chunk,
            cache = Cache;

        var zoomLevelMax = ZoomLevelMax;
    
        var file     = null,
            fileExt  = '.png';
    
        render();
    
        async function render() {
            var ix = 0,
                iy = 0,
                iz = 0,
                chunkX = chunk.getXZ().readInt32LE( 0 ),
                chunkZ = chunk.getXZ().readInt32LE( 4 );

            var composeArray = [ ];

            // Render chunk
            // Y-Axis
            for( iy = 0; iy <= chunk.getHeight(); iy++ )
            {
                // Z-Axis
                for( iz = 0; iz < 16; iz++ )
                {
                    // X-Axis
                    for( ix = 0; ix < 16; ix++ )
                    {
                        if ( chunk.get( ix, iy, iz ).name !== 'minecraft:air' ) {
                            await loadTexture( chunk.get( ix, iy, iz ).name, chunk.get( ix, iy, iz ).value, ix, iy, iz, cache );
                            composeArray.push( {
                                buffer: cache.get( chunk.get( ix, iy, iz ).name, chunk.get( ix, iy, iz ).value ),
                                x: size_texture*ix,
                                y: size_texture*iz
                            } );
                        };
                    };
                };
            };

            blend( composeArray, { width: 256, height: 256 }, function( err, data ) {
                // Zoomlevel Directory
                if ( !fs.existsSync( path.normalize( path_output + '/map/' + zoomLevelMax ) ) ) {
                    fs.mkdirSync( path.normalize( path_output + '/map/' + zoomLevelMax ) );
                };
                // X-Coordinate Directory
                if ( !fs.existsSync( path.normalize( path_output + '/map/' + zoomLevelMax + '/' + ( chunkX + Math.abs( worldOffset[ 'x' ][ 0 ] ) ) ) ) ) {
                    fs.mkdirSync( path.normalize( path_output + '/map/' + zoomLevelMax + '/' + ( chunkX + Math.abs( worldOffset[ 'x' ][ 0 ] ) ) ) );
                };
                    
                fs.writeFile( path.normalize( path_output + '/map/' + zoomLevelMax + '/' + ( chunkX + Math.abs( worldOffset[ 'x' ][ 0 ] ) ) + '/' + ( chunkZ + Math.abs( worldOffset[ 'z' ][ 0 ] ) ) + fileExt ), data, ( err ) => {
                    if ( err ) { throw err };
                } );
                    resolve();
            } );
        };
    } );
};