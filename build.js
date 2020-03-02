const json_package = require('./package.json');
const { exec } = require('pkg')
const colors = require('colors');
const path = require('path');
const fs = require('fs-extra');

(async () => {

    var destinationDir = (__dirname + '/dist/release/'),
        copyDir = '';

    console.log('Building ' + colors.bold(json_package.name.charAt(0) + json_package.name.slice(1, json_package.name.length - 2) + '.' + json_package.name.slice(json_package.name.length - 2) + ' v' + json_package.version + '-' + json_package.version_stage));

    /*
    console.log('Patching modules...');

    let patchContent = fs.readFileSync('./node_modules/mapnik/lib/mapnik.js').toString();
    patchContent = patchContent.replace("var binding_path = binary.find(path.resolve(path.join(__dirname,'../package.json')));", "var binding_path = binary.find(path.resolve(path.join('./node_modules/mapnik/package.json')));");
    fs.writeFileSync('./node_modules/mapnik/lib/mapnik.js', patchContent);
    */

    console.log('Packing application using pkg...');

    await exec(['package.json', '--target=node12-linux-x64', '--output', path.resolve(destinationDir + 'papyrusjs')]);

    console.log('Copying native modules to destination directory...');

    if (!fs.existsSync(destinationDir + 'node_modules/')) {
        fs.mkdirSync(destinationDir + 'node_modules/');
    }

    let currentModule;

    currentModule = 'ffi';
    console.log('Module:\t' + currentModule);
    if (!fs.existsSync(destinationDir + 'node_modules/' + currentModule + '/node_modules/ref/build/Release/')) {
        fs.mkdirSync(destinationDir + 'node_modules/' + currentModule + '/node_modules/ref/build/Release/', { recursive: true });
    }
    if (!fs.existsSync(destinationDir + 'node_modules/' + currentModule + '/build/Release/')) {
        fs.mkdirSync(destinationDir + 'node_modules/' + currentModule + '/build/Release/', { recursive: true });
    }
    copyDir = '/node_modules/' + currentModule + '/node_modules/ref/build/Release/' + 'binding.node';
    fs.copyFileSync(__dirname + copyDir, destinationDir + copyDir, );
    //
    copyDir = '/node_modules/' + currentModule + '/build/Release/' + 'ffi_bindings.node';
    fs.copyFileSync(__dirname + copyDir, destinationDir + copyDir, );

    currentModule = 'ref';
    console.log('Module:\t' + currentModule);
    if (!fs.existsSync(destinationDir + 'node_modules/' + currentModule + '/build/Release/')) {
        fs.mkdirSync(destinationDir + 'node_modules/' + currentModule + '/build/Release/', { recursive: true });
    }
    copyDir = '/node_modules/' + currentModule + '/build/Release/' + 'binding.node';
    fs.copyFileSync(__dirname + copyDir, destinationDir + copyDir);

    currentModule = 'ref-struct';
    console.log('Module:\t' + currentModule);
    if (!fs.existsSync(destinationDir + 'node_modules/' + currentModule + '/node_modules/ref/build/Release/')) {
        fs.mkdirSync(destinationDir + 'node_modules/' + currentModule + '/node_modules/ref/build/Release/', { recursive: true });
    }
    copyDir = '/node_modules/' + currentModule + '/node_modules/ref/build/Release/' + 'binding.node';
    fs.copyFileSync(__dirname + copyDir, destinationDir + copyDir);

    // Mapnik
    currentModule = 'mapnik';
    console.log('Module:\t' + currentModule);
    if (!fs.existsSync(destinationDir + 'node_modules/' + currentModule + '/lib/binding/lib/')) {
        fs.mkdirSync(destinationDir + 'node_modules/' + currentModule + '/lib/binding/lib/', { recursive: true });
    }
    copyDir = '/node_modules/' + currentModule + '/lib/binding/mapnik.node';
    fs.copyFileSync(__dirname + copyDir, destinationDir + copyDir);
    copyDir = '/node_modules/' + currentModule + '/lib/binding/lib/libmapnik.so';
    fs.copyFileSync(__dirname + copyDir, destinationDir + copyDir);

    console.log('Copying libraries...');
    if (!fs.existsSync(destinationDir + 'bin/')) {
        fs.mkdirSync(destinationDir + 'bin/');
    }
    copyDir = (process.platform === "win32") ? ('/bin/' + '/libleveldb.dll') : ('/bin/' + '/libleveldb.so');
    fs.copyFileSync(__dirname + copyDir, destinationDir + copyDir);

    console.log('Done. Ready for deployment!');
})();