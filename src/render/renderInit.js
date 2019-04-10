const Jimp = require( '../app.js' ).Jimp;
const path = require( '../app.js' ).path;

var renderInit = async function( path_textures, ext_textures ) {
    await Jimp.read( path.normalize( path_textures + 'sand' + ext_textures ), function( err, tex ) {
    if ( err )
    {
        app_error( err );
    };

    var render_texture_width  = tex.bitmap.width;
        render_texture_height = tex.bitmap.height;
            
    console.log( 'Texture size:\t\t' + render_texture_width + '\tx\t' + render_texture_height + '\tpx\nChunk image size:\t' + render_texture_width*16 + '\tx\t' + render_texture_height*16 + '\tpx' );

    } );
};

module.exports = renderInit;