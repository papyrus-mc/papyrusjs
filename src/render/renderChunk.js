const path    = require( 'path' );
const Jimp    = require( 'jimp' );
const fs      = require( 'fs' );
const tga2png = require( 'tga2png' );
const colors  = require( 'colors' );

const monoTable = require( '../app.js' ).monoTable;
const patchTable = require( '../app.js' ).patchTable;
const textureTable = require( '../app.js' ).textureTable;
const blockTable = require( '../app.js' ).blockTable;

module.exports = function( Chunk, Cache, size_texture ) {

    return new Promise( ( resolve, reject ) => {
        var chunk = Chunk;
        var cache = Cache;
        var IMG_render = new Jimp( size_texture*size_texture, size_texture*size_texture );
        var IMG_placeholder = new Jimp( 16, 16 );
    
        var file     = null,
            tpPath   = './dev/rp/',
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

            /*
            IMG_render.write( './dev/render/chunk' + '_X' + chunk.getXZ().readInt32LE( 0 ) + '_Z' + chunk.getXZ().readInt32LE( 4 ) + '.png' , () => {
                resolve();
            } );
            */

            
           IMG_render.write( './dev/render/leaflet/map/4/' + chunk.getXZ().readInt32LE( 0 ) + '/' + chunk.getXZ().readInt32LE( 4 ) + '.png' , () => {
            resolve();
            } );
            
        };
    
            async function compose( x, y, z ) {

                fileName = chunk.get( x, y, z ).name;
                // console.log( fileName );
            
                if ( fileName !== 'minecraft:air' ) // Ignore air
                {
                    // Does the texture have multiple faces?
                    if ( blockTable[ fileName.slice( 10 ) ] !== undefined ) {
                        // Does the texture have an extra key for an "up"-texture (obviously looks better for top-down renders)
                        if ( blockTable[ fileName.slice( 10 ) ][ "textures" ][ "up" ] ) {
                            texture = blockTable[ fileName.slice( 10 ) ][ "textures" ][ "up" ];
                        } else {
                        // No? Then get the default texture name for lookup
                            texture = blockTable[ fileName.slice( 10 ) ][ "textures" ];
                        };
                    };

                    // Is the file in the patch lookup-table (e.g. for water and lava)
                    if ( patchTable[ texture ] ) {
                        file = tpPath + patchTable[ texture ][ 'textures' ][ chunk.get( x, y, z ).value ];
                        // console.log( colors.bold( 'Patched texture found!' ) + '  Block:\t' + fileName + '\tValue:\t' + chunk.get( x, y, z ).value + '\tTexture:' + texture + '\tPath:\t' + file );
                    } else {
                        // No? Then search for the texture in the block lookup-table

                        // Get the correct "state" and path of the texture
                        // Is the texture missing?
                        if ( textureTable[ "texture_data" ][ texture ][ "textures" ][ chunk.get( x, y, z ).value ] === undefined ) {
                            console.log( colors.yellow( '[WARNING]' ) + ' Value not matching:\t' + texture + '\t(' + chunk.get( x, y, z ).name + '\t' + chunk.get( x, y, z ).value + ')' );
                            file = IMG_placeholder;
                        } else {
                            // Get the texture of it's current state

                            // Is the texture group an array?
                            var arr = textureTable[ "texture_data" ][ texture ][ "textures" ];
                            // Yes
                            if ( Array.isArray( arr ) ) {
                                file = tpPath + arr[ chunk.get( x, y, z ).value ];
                            } else {
                                // No
                                file = tpPath + arr;
                            };
                        };
                    };
                            
                        // TGA Loading
                        if ( ( !fs.existsSync( path.normalize( file + fileExt ) ) ) && ( file !== IMG_placeholder ) ) {
                            try {
                                await tga2png( fs.readFileSync( file + '.tga', ( err ) => { console.log( 'FILE WAS: ' + texture ); } ) )
                                        .then( ( buff ) => {
                                            file = buff;
                                        } )
                                        .catch( ( err ) => {
                                            console.log( colors.red( '[ERROR]' ) + ' Error when loading TGA: ' + err );
                                        } );
                            } catch ( err ) {
                                console.log( colors.red( '[ERROR]' ) + ' Failed to load TGA for\t' + colors.bold( fileName ) + '\t' + chunk.get( x, y, z ).value + '\t' + colors.bold( texture ) + '\tError: ' + err );
                            };
                        } else {
                            // PNG (but not if the image is a buffer already)
                            if ( file !== IMG_placeholder ) {
                                file = file + fileExt;
                            };
                        };
                    
                    // Compose!
                    await comp();
                };

                    async function comp() {
                        await Jimp.read( file )
                            .then( async function( image ) {
                                // Is the texture monochrome?
                                if ( monoTable[ texture ] !== undefined ) {
                                    image.composite( new Jimp( image ).color( [ { apply: 'mix', params: [ '#79c05a', 100 ] } ]), 0, 0, { mode: Jimp.BLEND_MULTIPLY } );
                                };
                                // Actual composing
                                IMG_render.composite( image, size_texture * x, size_texture * z );
                        } ) .catch( ( err ) => {
                            console.log( colors.red( '[ERROR]' ) + ' Could not read texture:\t' + file );
                        } );
                    }; 
            };
    } );
};