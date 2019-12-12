/**
 * Bindings for libvips.
 * @author clarkx86
 */

const ffi = require("ffi");
const ref = require("ref");
const arrayType = require("ref-array");
const path = require("path");

let libPath = path.resolve("./node_modules/sharp/vendor/lib/");

// Set library path temporarily if on Windows
function LibvipsWrapper() {
    let kernel32;

    if (process.platform == "win32") {
        kernel32 = ffi.Library("kernel32", {
            "SetDllDirectoryA": [ref.types.bool, [ref.types.CString]]
        })
        kernel32.SetDllDirectoryA(libPath);
    }
    
    this.VipsImage = ref.refType(ref.types.Object);
    this.VipsImageP = ref.refType(this.VipsImage);
    this.VipsImageArray = arrayType(this.VipsImageP);
    
    libvips = ffi.Library(path.resolve(libPath + "/libvips-42"), {
        "vips_init": [ref.types.int, [ref.types.CString]],
        "vips_shutdown": [ref.types.void, [ref.types.void]],
        // VipsImage class
        "vips_image_new_memory": [this.VipsImageP, []],
        "vips_foreign_find_load_buffer": [ref.types.CString, ["pointer", ref.types.size_t]],
        "vips_image_new_from_buffer": [this.VipsImageP, ["pointer", ref.types.size_t, "string", ref.refType(ref.types.void)]],
        "vips_image_new_from_file": [this.VipsImageP, [ref.types.CString, ref.refType(ref.types.void)]],
        "vips_image_write_to_file": [ref.types.int, [this.VipsImage, ref.types.CString, ref.refType(ref.types.void)]],
        // Create images
        "vips_black": [ref.types.int, [this.VipsImageP, ref.types.int, ref.types.int, ref.refType(ref.types.void)]],
    
        // Operations
        "vips_arrayjoin": [ref.types.int, [this.VipsImageArray, this.VipsImageP, ref.types.int, ref.types.CString, ref.types.int, ref.refType(ref.types.void)]],
        "vips_wrap": [ref.types.int, [this.VipsImageP, this.VipsImageP, ref.types.CString, ref.types.int, ref.types.CString, ref.types.int, ref.refType(ref.types.void)]]
    
    });
    // Reset library path if on Windows
    if (process.platform == "win32") {
        kernel32.SetDllDirectoryA(null);
    }

    libvips.vips_init(require("../package.json").name);
}

// Create new
LibvipsWrapper.prototype.Image = () => {
    return libvips.vips_image_new_memory();
}

LibvipsWrapper.prototype.newImageFromBuffer = function (data, callback) {
    console.log(libvips.vips_foreign_find_load_buffer(data, data.byteLength));
    return libvips.vips_image_new_from_buffer(data, data.byteLength, "", ref.NULL);
}

LibvipsWrapper.prototype.newImageFromFile = function (filePath) {
    return libvips.vips_image_new_from_file(filePath, ref.NULL);
}

LibvipsWrapper.prototype.newImageBlack = (w, h) => {
    let outImg = libvips.vips_image_new_memory();
    libvips.vips_black(outImg, w, h, ref.NULL);
    return ref.deref(outImg);
}

LibvipsWrapper.prototype.arrayJoin = (data, n) => {
    let outImg = libvips.vips_image_new_memory();
    libvips.vips_arrayjoin(data, outImg, data.length, "across", n, ref.NULL);
    return ref.deref(outImg);
}

LibvipsWrapper.prototype.wrap = (data, x, y) => {
    let outImg = libvips.vips_image_new_memory();
    libvips.vips_wrap(data, outImg, "x", x, "y", y, ref.NULL);
    return ref.deref(outImg);
}

LibvipsWrapper.prototype.toFile = (data, fName) => {
    libvips.vips_image_write_to_file(data, path.resolve(fName), ref.NULL);
}

module.exports = LibvipsWrapper;