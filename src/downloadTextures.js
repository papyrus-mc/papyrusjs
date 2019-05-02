const fetch   = require( 'node-fetch' );
const fs      = require( 'fs' );
const path    = require( 'path' );
const extract = require( 'extract-zip' );

const urlTextures      = 'https://aka.ms/resourcepacktemplate';
const pathTexturesTmp  = 'textures.tmp.zip';

module.exports = function( pathExtract ) {
    return new Promise( ( resolve, reject ) => {
        const pathZip = path.join( pathExtract, pathTexturesTmp );
        new Promise( ( resolve, reject ) => {
            fs.mkdirSync( pathExtract, { recursive: true }, ( err ) => {
                if ( err ) {
                    reject( err );
                    throw err;
                } else { console.log( '123' ); resolve(); }
            } );
        } )
        /*
        .then( () => {
            console.log( '123' );
            fetch( urlTextures )
                .then( ( resp ) => {
                    console.log( resp );
                            // if ( !resp.ok ) { throw "Failed to download textures, the address " + textures_address + " returned a non-ok response"; } else { console.log( 'ok' ) };
                } )
            } )
        .catch( ( err ) => { if ( err ) { throw err; } } );
        */ } );

    /*
    const zip_address = lib_path.join(extract_address, tmp_textures_address);
    return lib_fs.promises.mkdir(extract_address, { recursive: true })
    .catch(err => { throw err.toString() + "\nFailed to download textures, the specified texture folder already exists" })

    .then(() => { return fetch(textures_address) })
    .then(response => {
        if (!response.ok) throw "Failed to download textures, the address " + textures_address + " returned a non-ok response";
        return new Promise((resolve, reject) => {
            const write_stream = lib_fs.createWriteStream(zip_address);
            response.body.pipe(write_stream);
            response.body.on("end", resolve);
            response.body.on("error", err => reject(err.toString() + "\nFailed to download textures, the connection encountered an error"));
            write_stream.on("error", err => reject(err.toString() + "\nFailed to download textures, an error occured while writing to the disk"));
        });
    })

    .then(() => new Promise((resolve, reject) => {
        lib_extract(zip_address, { dir: lib_path.dirname(zip_address) }, err => {
            if (err !== null && err !== undefined) reject(err.toString() + "\nFailed to download textures, zip extraction failed");
            else resolve();
        });
    }))
    
    .catch(err => console.log(err))
    .finally(() => { return lib_fs.promises.unlink( zip_address ) })
    .catch(err => console.log(err.toString() + "\nFailed to cleanup after downloading textures"));
    */
}