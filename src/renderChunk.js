function renderChunk( size_texture, size_chunk, chunk_x, chunk_y ) {
    let chunk_render = PImage.make( size_texture*size_chunk, size_texture*size_chunk );

    console.log( 'Rendering chunk: ' + render_current + '/' + render_total /* + ' (Available memory: ' + ')' */ );

    let ix, iy, iz;

    // Render chunk
    // Y-Axis
    for( iy = 0; i < 256; i++ )
    {
        // X-Axis
        for( ix = 0; i < size_chunk/size_texture; i++ )
        {
            for( iz = 0; i < size_chunk/size_texture; i++ )
            {
                
            };
        };
    };
};