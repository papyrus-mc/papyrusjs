exports.renderChunk = function( size_texture, size_chunk, chunk_x, chunk_y, render_current, render_total ) {
    // let chunk_render = new Jimp( size_texture*size_chunk, size_texture*size_chunk );

    console.log( 'Rendering chunk: ' + render_current + '/' + render_total /* + ' (Available memory: ' + ')' */ );
    let ix, iy, iz, i, ii, iii;

    // Render chunk
    // Y-Axis
    for( iy = 0; i < 256; i++ )
    {
        // X-Axis
        for( ix = 0; ii < size_chunk/size_texture; i++ )
        {
            // Z-Axis
            for( iz = 0; iii < size_chunk/size_texture; i++ )
            {
                
            };
        };
    };
};