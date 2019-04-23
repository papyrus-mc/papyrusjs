const path    = require( 'path' );
// const Jimp    = require( 'jimp' );
// const sharp   = require( 'sharp' );
const blend   = require( '@mapbox/blend' );
const fs      = require( 'fs' );
const tga2png = require( 'tga2png' );
const colors  = require( 'colors' );

const path_output       = require( '../app.js' ).path_output;
const path_resourcepack = require( '../app.js' ).path_resourcepack;

/*
const monoTable = require( '../app.js' ).monoTable;
const patchTable = require( '../app.js' ).patchTable;
const textureTable = require( '../app.js' ).textureTable;
const blockTable = require( '../app.js' ).blockTable;
const zoomLevelMax = require( '../app.js' ).zoomLevelMax;
*/

module.exports = function( Chunk, Cache, size_texture, PatchTable, BlockTable, TextureTable, MonoTable, ZoomLevelMax, PathResourcePack, PathOutput ) {

    return new Promise( ( resolve, reject ) => {
        var chunk = Chunk;
        var cache = Cache;

        var patchTable = PatchTable,
            blockTable = BlockTable,
            textureTable = TextureTable,
            monoTable = MonoTable;

        var path_output = PathOutput,
            path_resourcepack = PathResourcePack;

        var zoomLevelMax = ZoomLevelMax;
    
        var file     = null,
            fileExt  = '.png';

        var canvas = cache.get( 'tile_canvas', 0 ),
            IMG_placeholder = cache.get( 'placeholder', 0 );

        // var IMG = new Jimp( 256, 256 );
    
        render();
    
        async function render() {
            var ix = 0,
                iy = 0,
                iz = 0,
                Y  = [ ],
                chunkContent = chunk.list();

            // This may look confusing, but just slices the Vec3 string of the first and last entry of the trimmed chunk object to get the min. and max. Y and parses the it into an integer
            Y[ 0 ] = parseInt( Object.keys( chunkContent )[ Object.keys( chunkContent ).length-1 ].slice( Object.keys( chunkContent )[ Object.keys( chunkContent ).length-1 ].indexOf( ',' ) + 2, Object.keys( chunkContent )[ Object.keys( chunkContent ).length-1 ].indexOf( ',', Object.keys( chunkContent )[ Object.keys( chunkContent ).length-1 ].indexOf( ',' ) + 1 ) ) );
            Y[ 1 ] = parseInt( Object.keys( chunkContent )[ 0 ].slice( Object.keys( chunkContent )[ 0 ].indexOf( ',' ) + 2, Object.keys( chunkContent )[ 0 ].indexOf( ',', Object.keys( chunkContent )[ 0 ].indexOf( ',' ) + 1 ) ) );
            
            // console.log( 'Y0: ' + Y[ 0 ] + ', Y1: ' + Y[ 1 ] );
    
            var composeArray = [ ];

            // Render chunk
            // Y-Axis
            for( iy = Y[ 0 ]; iy <= Y[ 1 ]; iy++ )
            // for( iy = 0; iy < 256; iy++ )
            {
                // Z-Axis
                for( iz = 0; iz < 16; iz++ )
                {
                    // X-Axis
                    for( ix = 0; ix < 16; ix++ )
                    {
                        loadTexture( chunk.get( ix, iy, iz ).name, ix, iy, iz );
                        composeArray.push( {
                            buffer: cache.get( chunk.get( ix, iy, iz ).name, chunk.get( ix, iy, iz ).value ),
                            x: size_texture * ix,
                            y: size_texture* iz
                        } );
                        // console.log( cache.get( chunk.get( ix, iy, iz ).name, chunk.get( ix, iy, iz ).value ) );
                    };
                };
            };

            blend( composeArray, { width: 256, height: 256 }, function( err, data ) {
                    fs.writeFile( path.normalize( path_output + '/map/' + chunk.getXZ().readInt32LE( 0 ) + '_' + chunk.getXZ().readInt32LE( 4 ) + fileExt ), data, ( err ) => {
                        if ( err ) { throw err };
                    } );
                    resolve();
                } );
            
        };
    
        async function loadTexture( fileName, x, y, z ) {
                    // Is the texture in the cache already? No: Load texture from filesystem, Yes: Skip to compositing :)!
                    if ( cache.get( fileName, chunk.get( x, y, z ).value ) === undefined ) {
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
                            file = path_resourcepack + patchTable[ texture ][ 'textures' ][ chunk.get( x, y, z ).value ];
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
                                    file = path_resourcepack + arr[ chunk.get( x, y, z ).value ];
                                } else {
                                    // No
                                    file = path_resourcepack + arr;
                                };
                            };
                        };
                                
                            // TGA Loading
                            if ( ( !fs.existsSync( path.normalize( file + fileExt ) ) ) && ( file !== IMG_placeholder ) ) {
                                try {
                                    await tga2png( fs.readFileSync( file + '.tga', ( err ) => { console.log( 'FILE WAS: ' + texture ); } ) )
                                            .then( ( buff ) => {

                                                cache.save( fileName, chunk.get( x, y, z ).value, buff );

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
                                    // cache.save( fileName, chunk.get( x, y, z ).value, fs.readFileSync( file + fileExt ) );
                                    cache.save( fileName, chunk.get( x, y, z ).value, fs.readFileSync( file + fileExt ) );
                                };
                            };  
                    };
                };
    } );
};