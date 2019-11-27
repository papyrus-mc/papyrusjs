const fetch = require('node-fetch');
const lib_fs = require('fs-extra');
const lib_path = require('path');
const lib_extract = require('extract-zip');
const ProgressBar = require('progress');
const colors = require('colors');

const textures_address = 'https://aka.ms/resourcepacktemplate';
const tmp_textures_address = 'textures.tmp.zip';

function exists(val) { return val !== null && val !== undefined }

module.exports = function (extract_address) {
    const zip_address = lib_path.join(extract_address, tmp_textures_address);
    console.log(zip_address);
    return (new Promise((resolve, reject) => {
        lib_fs.mkdir(extract_address, { recursive: true }, err => {
            if (exists(err)) reject(err);
            resolve();
        });
    }))
        .catch(err => { throw err.toString() + "\nFailed to download textures, the specified texture folder already exists" })

        .then(() => { return fetch(textures_address) })
        .then(response => {
            if (!response.ok) throw "Failed to download textures, the address " + textures_address + " returned a non-ok response";
            return new Promise((resolve, reject) => {
                const write_stream = lib_fs.createWriteStream(zip_address);
                var bar = new ProgressBar(colors.bold('[') + ':bar' + colors.bold(']') + ' :percent\tDownloading...\t:current/ :total', {
                    total: parseInt(response.headers.get('content-length')),
                    complete: colors.inverse('='),
                    width: 32
                });
                response.body.pipe(write_stream);
                response.body.on('data', (dataChunk) => { bar.tick(dataChunk.length) });
                response.body.on("end", resolve);
                response.body.on("error", err => reject(err.toString() + "\nFailed to download textures, the connection encountered an error"));
                write_stream.on("error", err => reject(err.toString() + "\nFailed to download textures, an error occured while writing to the disk"));
            });
        })

        .then(() => new Promise((resolve, reject) => {
            console.log('Extracting...');
            lib_extract(zip_address, { dir: lib_path.dirname(zip_address) }, err => {
                if (err !== null && err !== undefined) reject(err.toString() + "\nFailed to download textures, zip extraction failed");
                else resolve();
            });
        }))

        .catch(err => console.log(err))
        .finally(() => {
            return new Promise((resolve, reject) => {
                lib_fs.unlink(zip_address, err => {
                    if (exists(err)) reject(err);
                    resolve();
                })
            })
        })
        .catch(err => console.log(err.toString() + "\nFailed to cleanup after downloading textures"));
}