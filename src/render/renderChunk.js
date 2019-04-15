const path = require( 'path' );
const Jimp = require( 'jimp' );
const fs   = require( 'fs' );

module.exports = function( Chunk, Cache, size_texture, missingDefinitions, mDcache ) {

    return new Promise( ( resolve, reject ) => {
        var chunk = Chunk;
        var cache = Cache;
        var mdcache = mDcache;
        var IMG_render = IMG_render = new Jimp( size_texture*size_texture, size_texture*size_texture );
        var IMG_placeholder = new Jimp( 16, 16 );
    
        var file     = null,
            filePath = './rp/textures/blocks/',
            fileExt  = '.png';
    
        render();
    
        async function render() {
            var ix = 0,
                iy = 0,
                iz = 0;
    
            // console.log( chunk.getXZ() );
            // console.log( chunk.list() );
    
            // Render chunk
            // Y-Axis
            for( iy = 0; iy < 256; iy++ )
            {
                // Z-Axis
                for( iz = 0; iz < 16; iz++ )
                {
                    // X-Axis
                    for( ix = 0; ix < 16; ix++ )
                    {
                        await compose( ix, iy, iz );
                    };
                    await compose( ix, iy, iz );
                };
            };
    
            console.log( 'Writing to "chunk' + '_X' + chunk.getXZ().readInt32LE( 0 ) + '_Z' + chunk.getXZ().readInt32LE( 4 ) + '.png"' );

            IMG_render.write( './dev/render/chunk' + '_X' + chunk.getXZ().readInt32LE( 0 ) + '_Z' + chunk.getXZ().readInt32LE( 4 ) + '.png' );
            resolve();

            /*
            IMG_render.write( './dev/render/chunk' + '_X' + chunk.getXZ().readInt32LE( 0 ) + '_Z' + chunk.getXZ().readInt32LE( 4 ) + '.png', function() {
                resolve();
            } );
            */

        };
    
            async function compose( x, y, z ) {
        
            fileName = chunk.get( x, y, z ).name;
            // console.log( fileName );
        
            if ( fileName != 'minecraft:air' )
            {
                if ( fs.existsSync( filePath + fileName.slice( 10 ) + fileExt ) ) {
                    file = path.normalize( filePath + fileName.slice( 10 ) + fileExt );
                } else {
        
                    if ( missingDefinitions[ fileName ] === undefined )
                    {
                        console.log( 'Missing definition: ' + fileName );
                    };
        
                    // For modelled blocks such as fences, just skip for now
                    if ( missingDefinitions[ fileName ] === null ) {
                        file = IMG_placeholder;
                    } else {
                        fileName = missingDefinitions[ fileName ];
                        file = path.normalize( filePath + fileName[ 0 ] + fileExt );
                    };
                    // console.log( file );
                };
        
                await IMG_render.composite( await Jimp.read( file ), size_texture * x, size_texture * z, ( err ) => {
                    if ( err ) { throw err };
                } );
            };        
        };
    } );

    
};