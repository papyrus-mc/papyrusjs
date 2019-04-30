const fetch      = require("node-fetch");
const lib_fs     = require("fs");
const lib_path   = require("path");

const textures_address = "https://aka.ms/resourcepacktemplate"

module.exports = function() {
    const tmp_path = lib_path.normalize("./tmp_textures.zip");
    fetch(textures_address)
    .then(response => {
        if (!response.ok) throw "Failed to download textures, the address " + textures_address + " returned a non-ok response";
        return new Promise((resolve, reject) => {
            const write_stream = fs.createWriteStream(tmp_path);
            response.body.pipe(write_stream);
            response.body.on("end", resolve);
            response.body.on("error", err => reject(err.toString() + "\nFailed to download textures, the connection encountered an error"));
            write_stream.on("error", err => reject(err.toString() + "\nFailed to download textures, an error occured while writing to the disk"));
        });
    })
    .then(() => {

    });
}