const path = require( 'path' );
const Jimp = require( 'jimp' );
// const sharp = require('sharp');
// const gm   = require('gm');
const fs   = require( 'fs' );

// const Cache = require( '../palettes/textureCache' );

module.exports = function( Chunk, Cache, size_texture ) {

    var chunk = Chunk;
    var cache = Cache;
    var IMG_render = null;

    IMG_render = new Jimp( size_texture*size_texture, size_texture*size_texture );
    console.log( IMG_render );

    render();

    async function render() {
        

        var ix = 0,
            iy = 0,
            iz = 0;

        console.log( chunk.getXZ() );
        // console.log( chunk.list() );

        // Render chunk
        // Y-Axis
        for( iy = 60; iy < 256; iy++ )
        {
            // X-Axis
            for( iz = 0; iz < 16; iz++ )
            {
                // Z-Axis
                for( ix = 0; ix < 16; ix++ )
                {
                    await compose( ix, iy, iz );
                };
                await compose( ix, iy, iz );
            };
        };

        // console.log( 'Writing to "chunk' + '_X' + chunk.getXZ().x + '_Z' + chunk.getXZ().z + '.png"' );
        IMG_render.write( './dev/render/chunk' + '_X' + chunk.getXZ().x + '_Z' + chunk.getXZ().z + '.png' );
    };

async function compose( x, y, z ) {
    fileName = chunk.get( x, y, z ).name.slice( 10 );

    if ( fileName === 'air' ) {
        // Do nothing
    } else {
        imgData = cache.get( chunk.get( x, y, z ).name, chunk.get( x, y, z ).value );

        if ( imgData === undefined ) {
            // Load image from scratch
            fileName = path.normalize( './render/blocks/' + fileName + '.png' );
        } else {
            if ( imgData == '[object Object]' )
            {
                // console.log( chunk.get( x, y, z ).name + ' was in cache as definition "' + imgData.definition + '"' );
                fileName = path.normalize( './render/blocks/' + imgData.definition.slice( 10 ) + '.png' );
            } else {
                console.log( chunk.get( x, y, z ).name + ' was in cache as data.' );
                fileName = imgData; // Load buffer
            };
        };

        // console.log( 'Rendering:\tx\t' + x + '\ty\t' + y + '\tz\t' + z + '\t' + fileName );

        await IMG_render.composite( await Jimp.read( fileName ), size_texture * x, size_texture * z, ( err ) => {
            if ( err ) { throw err };
        } );

        // IMG_render.write( './dev/render/chunk' + '_X' + chunk.getXZ().x + '_Z' + chunk.getXZ().z + '.png' );
    };
};
};