const json_package = require( './package.json' );
const { exec } = require( 'pkg' )
const archiver = require( 'archiver' );
const colors = require( 'colors' );
const fs = require( 'fs' );
const path = require( 'path' );

(async function() {

    var destinationDir = ( __dirname + '/dist/v' + ( json_package.version + '-' + json_package.version_stage ) ),
        copyDir = '';

    console.log( 'Building ' + colors.bold( json_package.name.charAt( 0 ) + json_package.name.slice( 1, json_package.name.length - 2 ) + '.' + json_package.name.slice( json_package.name.length - 2 ) + ' v' + json_package.version + '-' + json_package.version_stage ) );
    console.log( 'Packing application using pkg...' );
    
    await exec( [ 'app.js','--target=node10-linux-x64','--output='+destinationDir+'/papyrus' ] );

    console.log( 'Copying native modules to destination directory...' );
    // fs.mkdirSync( destinationDir + '/node_modules/' );
    
    var currentModule;

    /*
    currentModule = 'leveldb-mcpe';
    console.log( 'Module:\t' + currentModule );
    copyDir = '/node_modules/' + currentModule + '/build/Release/node_leveldb_mcpe_native.node';
    
    fs.mkdirSync( destinationDir + '/node_modules/' + currentModule );
    fs.mkdirSync( destinationDir + '/node_modules/' + currentModule + '/build/' );
    fs.mkdirSync( destinationDir + '/node_modules/' + currentModule + '/build/Release/' );

    fs.copyFileSync( __dirname + copyDir, destinationDir + copyDir );

    currentModule = 'mapnik';
    console.log( 'Module:\t' + currentModule );
    fs.mkdirSync( destinationDir + '/node_modules/' + currentModule );
    fs.mkdirSync( destinationDir + '/node_modules/' + currentModule + '/lib/' );
    fs.mkdirSync( destinationDir + '/node_modules/' + currentModule + '/lib/binding/' );

    copyDir = '/node_modules/' + currentModule + '/package.json';
    fs.copyFileSync( __dirname + copyDir, destinationDir + copyDir );
    copyDir = '/node_modules/' + currentModule + '/LICENSE.txt';
    fs.copyFileSync( __dirname + copyDir, destinationDir + copyDir );
    copyDir = '/node_modules/' + currentModule + '/lib/binding/';
    fs.copyFileSync( __dirname + copyDir, destinationDir + copyDir );
    */
}());