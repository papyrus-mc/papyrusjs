const colors  = require( 'colors' ),
      fs      = require( 'fs' ),
      mapnik  = require( 'mapnik' ),
      path    = require( 'path' ),
      tga2png = require( 'tga2png' );

const patchTable   = require( '../../app.js' ).patchTable,
      blockTable   = require( '../../app.js' ).blockTable,
      textureTable = require( '../../app.js' ).textureTable,
      monoTable    = require( '../../app.js' ).monoTable,
      path_resourcepack = require( '../../app.js' ).path_resourcepack;

      const renderMode        = require( '../../app.js' ).renderMode;
    
var file    = null,
    fileExt = '.png';

module.exports = async function loadTexture( name, value, x, y, z, blockY, cache ) {
    // Is the texture in the cache already? No: Load texture from filesystem, Yes: Skip to compositing :)!
    if ( cache.get( name, value, blockY ) === undefined ) {
        var imageBuffer = null;
        // Does the texture have multiple faces?
        if ( blockTable[ name.slice( 10 ) ] !== undefined ) {
            // Does the texture have an extra key for an "up"-texture (obviously looks better for top-down renders)
            if ( blockTable[ name.slice( 10 ) ][ "textures" ][ "up" ] ) {
                texture = blockTable[ name.slice( 10 ) ][ "textures" ][ "up" ];
            } else {
            // No? Then get the default texture name for lookup
                texture = blockTable[ name.slice( 10 ) ][ "textures" ];
            };
        };

        // Is the file in the patch lookup-table (e.g. for water and lava)
        if ( patchTable[ texture ] ) {
            file = path_resourcepack + patchTable[ texture ][ 'textures' ][ value ];
            // console.log( colors.bold( 'Patched texture found!' ) + '  Block:\t' + name + '\tValue:\t' + chunk.get( x, y, z ).value + '\tTexture:' + texture + '\tPath:\t' + file );
        } else {
            // No? Then search for the texture in the block lookup-table

            // Get the correct "state" and path of the texture
            // Is the texture missing?
            if ( textureTable[ "texture_data" ][ texture ][ "textures" ][ value ] === undefined ) {
                console.log( colors.yellow( '\n[WARNING]' ) + ' Value not matching:\t' + texture + '\t(' + name + '\t' + value + ')' );
                cache.save( name, value, cache.get( 'placeholder', 0 ) );
            } else {
                // Get the texture of it's current state

                // Is the texture group an array?
                var arr = textureTable[ "texture_data" ][ texture ][ "textures" ];
                // Yes
                if ( Array.isArray( arr ) ) {
                    file = path_resourcepack + arr[ value ];
                } else {
                    // No
                    file = path_resourcepack + arr;
                };
            };
        };
                
        // TGA Loading
        if ( ( !fs.existsSync( path.normalize( file + fileExt ) ) ) && ( file !== cache.get( 'placeholder', 0 ) ) ) {
            try {
                await tga2png( fs.readFileSync( file + '.tga', ( err ) => { console.log( 'FILE WAS: ' + texture ); } ) )
                        .then( ( buff ) => {
                            imageBuffer = buff;
                        } )
                        .catch( ( err ) => {
                            imageBuffer = cache.get( 'placeholder', 0 );
                            console.log( colors.yellow( '\n[WARNING]' ) + ' Error when loading TGA: ' + err );
                        } );
            } catch ( err ) {
                imageBuffer = cache.get( 'placeholder', 0 );
                console.log( colors.yellow( '\n[WARNING]' ) + ' Failed to load TGA for\t' + colors.bold( name ) + '\t' + value + '\t' + colors.bold( texture ) + '\tError: ' + err );
            };
        } else {
            // PNG (but not if the image is a buffer already)
            if ( file !== cache.get( 'placeholder', 0 ) ) {
                // cache.save( name, chunk.get( x, y, z ).value, fs.readFileSync( file + fileExt ) );
                imageBuffer = fs.readFileSync( file + fileExt );
            };
        };

        // Blend monochrome textures with colour and save to cache
        if ( monoTable[ texture ] == true ) {
            var img = new mapnik.Image.fromBytesSync( imageBuffer );
            img.premultiplySync();
            await new Promise ( (resolve, reject ) => {
                img.composite( cache.get( 'mono_default', 0 ), {
                    comp_op: mapnik.compositeOp[ 'multiply' ],
            }, function( err, buffer ) {
                if ( err ) { reject(); throw err; };
                imageBuffer = buffer;
                resolve();
                } );
            } ); 
        };

        if( name != 'minecraft:water' ) {
        switch( renderMode ) {
            case 'topdown_shaded':
                if (imageBuffer['scaling'] == undefined) {
                    imageBuffer = mapnik.Image.fromBytesSync(imageBuffer);
                };
                imageBuffer.premultiplySync();
        
                var opac     = 0,
                    blendImg = null;

                switch( true ) {
                    case ( blockY < 64 ):
                        blendImg  = cache.get('blend_black', 0);
                        opac      = (64-blockY)/(blockY*64);
                        break;
                    case ( blockY >= 64 ):
                        blendImg  = cache.get('blend_white', 0);
                        opac      = (-64+blockY)/(blockY);
                        break;
                };

                await imageBuffer.composite( blendImg, {
                    comp_op: mapnik.compositeOp['overlay'], // comp_mode,
                    opacity: opac
                }, (err, data) => {
                    imageBuffer = data;
                } )
                break;
        } };
        cache.save( name, value, imageBuffer, blockY );
    };
};