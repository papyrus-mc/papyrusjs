const path = require( 'path' );
const Jimp = require( 'jimp' );

var renderChunk = function( Chunk, size_texture, render_current, render_total ) {
    chunk = Chunk;
    let chunk_render = new Jimp( size_texture*size_texture, size_texture*size_texture );

    console.log( chunk.get( 0, 0, 0 ).slice( 10 ) );
    console.log( path.normalize( './blocks/' + chunk.get( 0, 0, 0 ).slice( 10 ) + '.png' ) );

    console.log( 'Rendering chunk: ' + render_current + '/' + render_total /* + ' (Available memory: ' + ')' */ );
    let ix, iy, iz, i, ii, iii;

    // Render chunk
    // Y-Axis
    for( iy = 0; iy < 256; iy++ )
    {
        // X-Axis
        for( ix = 0; ix < size_texture; ix++ )
        {
            // Z-Axis
            for( iz = 0; iz < size_texture; iz++ )
            {
                Jimp.read( path.normalize( './blocks/' + chunk.get( ix, iy, iz ).slice( 10 ) + '.png' ), function( buffer ) {
                } );
                chunk_render.composite( block, ix * size_texture, iz * size_texture )
            };
        };
    };
};

module.exports = renderChunk;