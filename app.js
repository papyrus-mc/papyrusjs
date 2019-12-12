const json_package = require('./package.json'),
      fs = require('fs'),
      path = require('path'),
      colors = require('colors'),
      stripJsonComments = require('strip-json-comments'),
      ProgressBar = require('progress'),
      Chunk = require('./palettes/chunk.js'),
      cluster = require('cluster'),
      os = require('os'),
      LibvipsWrapper = require("./bindings/LibvipsWrapper.js");

const argv = require('yargs')
    .version(json_package.version + json_package.version_stage.charAt(0))
    .option('output', {
        alias: 'o',
        default: './output/'
    })
    .option('world', {
        alias: 'w'
    })
    .option('textures', {
        alias: 't',
        default: './textures/'
    })
    .option('threads', {
        default: os.cpus().length
    })
    .option('mode', {
        alias: 'm'
    })
    .option('threshold', {
        alias: 'y',
        default: 256
    })
    .option('force-download', {
        default: false,
        type: 'boolean'
    })
    .option("force-render", {
        default: false,
        type: "boolean"
    })
    .option('verbose', {
        alias: 'v',
        default: false,
        type: 'boolean'
    })
    .demandOption(['world', 'textures', 'output'])
    .argv;

const LOG_ERR = (colors.red.bold("[ERROR]") + " "),
      LOG_WARN = (colors.yellow("[WARNING]") + " "),
      LOG_VERBOSE = (colors.blue("[VERBOSE]") + " ");

let path_output = path.normalize(argv.output),
    path_resourcepack = path.normalize(argv.textures),
    zoomLevelMax = process.env['zoomLevelMax'],
    renderMode = argv.mode;

let transparentBlocks = require('./lookup_tables/transparent-blocks_table.json'),
    runtimeIDTable = require('./lookup_tables/runtimeid_table.json'),
    monoTable = require('./lookup_tables/monochrome-textures_table.json'),
    patchTable = require('./lookup_tables/patch-textures_table.json');
if (fs.existsSync(argv.textures + 'blocks.json')) {
    textureTable = JSON.parse(stripJsonComments(fs.readFileSync(path.normalize(argv.textures + '/textures/terrain_texture.json')).toString())),
    blockTable = JSON.parse(stripJsonComments(fs.readFileSync(path.normalize(argv.textures + 'blocks.json')).toString()));
} else {
    textureTable = null;
    blockTable = null;
}

let vips = new LibvipsWrapper();

module.exports = { argv, renderMode, transparentBlocks, runtimeIDTable, monoTable, patchTable, textureTable, blockTable, path_output, path_resourcepack, vips };

if (cluster.isMaster) {
    console.log(colors.bold(json_package.name.charAt(0) + json_package.name.slice(1, json_package.name.length - 2) + "." + json_package.name.slice(json_package.name.length - 2) + " v" + json_package.version + json_package.version_stage.charAt(0)) + colors.reset(" by ") + json_package.author + " and contributors");

    // Check for latest version
    require('./updateCheck.js')();

    if (argv.verbose === true) {
        console.log(colors.bold("Verbose mode") + " is on! You will see debug console output.");
    }
    if (argv.output === "./output/") {
        console.log(LOG_WARN + " No output path specified. The default path \"./output/\" will be used.");
    }
    if (argv.output === "./textures/") {
        console.log(LOG_WARN + " No texture path specified. The default path \"./textures/\" will be used.");
    }

    console.log('Threads: ' + argv.threads);

    // Download textures if textures can't be found
    new Promise((resolve, reject) => {
        if ((argv['force-download'] === true) || (!fs.existsSync(path.normalize(argv.textures + 'blocks.json')))) {
            console.log('Texture directory is missing or ' + colors.italic('--force-download') + ' has been specified. Downloading...');
            require('./downloadTextures.js')(path.resolve(argv.textures))
                .then(() => { resolve(); })
                .catch((err) => { throw err; });
        } else {
            resolve();
        }
    }).then(() => {
        // Run
        init(path.normalize(argv.world), path.normalize(argv.output));
    });

    function init(path_world, path_output) {
        let path_leveldat = path.normalize(path_world);
        if (fs.existsSync(path_leveldat) != 1) {
            console.log(LOG_ERR + " Invalid world path.");
            return;
        }
        let db_keys = [],
        chunksTotal = [];

        chunksTotal[0] = 0; // SubChunks

        // Open database
        console.log("Attempting to open database...");
        let LevelDbWrapper = new (require("./bindings/LevelDbWrapper.js"))("./bin/libleveldb");
        LevelDbWrapper.open(path_leveldat + '/db/', () => {
            console.log("Success!");
        });

        // Iterate through database to store a dictionary of SubChunks
        console.log("Reading database. This can take a couple of seconds up to a couple of minutes.");
        LevelDbWrapper.iterate((data, value) => {
            // Only read adequate keys which are specifically SubChunks
            if (data.length > 8 && data.readInt8(8) === 47) {
                // Dump pointers to the subchunk keys
                let subChunkIndex = data.slice(0, 8).toString("hex");
                if (db_keys[subChunkIndex] == null) {
                    db_keys[subChunkIndex] = [];
                }
                db_keys[subChunkIndex].push(data); // = data;
                chunksTotal[0]++;
            }
        });

        (() => {
            if (argv.verbose) {
                console.log(LOG_VERBOSE + 'Allocated ' +
                    Math.round((process.memoryUsage().heapUsed / Math.pow(1024, 2))) +
                    ' MB of memory when iterating through the database.'
                );
            }

            let chunkX = [0, 0],
                chunkZ = [0, 0];

            // Count chunks
            Object.keys(db_keys).forEach(function (key) {
                // Update XZ-Distance
                if (db_keys[key][0].readInt32LE(0) <= chunkX[0]) { chunkX[0] = db_keys[key][0].readInt32LE(0) }
                if (db_keys[key][0].readInt32LE(0) >= chunkX[1]) { chunkX[1] = db_keys[key][0].readInt32LE(0) }
                if (db_keys[key][0].readInt32LE(4) <= chunkZ[0]) { chunkZ[0] = db_keys[key][0].readInt32LE(4) }
                if (db_keys[key][0].readInt32LE(4) >= chunkZ[1]) { chunkZ[1] = db_keys[key][0].readInt32LE(4) }
            });

            let zoomLevelMax = null;

            if ((chunkX[1] - chunkX[0]) >= (chunkZ[1] - chunkZ[0])) {
                // console.log( 'X is bigger: ' + ( chunkX[ 1 ] - chunkX[ 0 ] ) + 1 );
                zoomLevelMax = Math.round(Math.log2((chunkX[1] - chunkX[0])));
            } else {
                // console.log( 'Z is bigger: ' + ( chunkZ[ 1 ] - chunkZ[ 0 ] ) );
                zoomLevelMax = Math.round(Math.log2((chunkZ[1] - chunkZ[0]) + 1));
            }

            // Prepare output directory
            prepareOutput();

            console.log('World reaches from chunks\tX:\t' + chunkX[0] + ",\t" + "Z:\t" + chunkZ[0] + "\t" + colors.bold("to") + "\tX:\t" + "+" + chunkX[1] + ",\t" + "Z:\t" + "+" + chunkZ[1]);
            console.log('Processing and rendering ' + colors.bold(Object.keys(db_keys).length) + ' Chunks, which ' + colors.bold(chunksTotal[0]) + ' of them are valid SubChunks...');

            let bar = new ProgressBar(colors.bold('[') + ':bar' + colors.bold(']') + ' :percent\tProcessing chunk :current/ :total\t:rate chunks/Second', {
                total: Object.keys(db_keys).length,
                complete: colors.inverse('='),
                width: 32
            });

            let workers = [],
                chunksPerThread = Math.floor(Object.keys(db_keys).length / argv.threads),
                start = 0,
                finishedWorkers = 0;

            // Compute the number of chunks not allocated to workers.
            let extra_chunks = Object.keys(db_keys).length - (chunksPerThread * argv.threads);
            // Create worker for each thread
            for (let i = 0; i < argv.threads; i++) {
                let workerArgs = {};
                workerArgs['ID'] = i;
                workerArgs['start'] = start;
                workerArgs['end'] = start + chunksPerThread - 1;
                workerArgs['worldOffset'] = JSON.stringify({ 'x': chunkX, 'z': chunkZ });
                workerArgs['chunksTotal'] = Object.keys(db_keys).length;
                workerArgs['zoomLevelMax'] = zoomLevelMax;
                workerArgs['yThreshold'] = argv.threshold;

                // Evenly allocate the extra chunks
                if (extra_chunks > 0) {
                    workerArgs['end'] += 1;
                    start += chunksPerThread + 1;
                    extra_chunks--;
                } else {
                    start += chunksPerThread;
                }

                // Fork new worker
                workers.push(cluster.fork(workerArgs));
            }

            // WORKER EVENT HANDLER
            cluster.on('message', (worker, msg) => {
                //console.log( 'Got message from: ' + worker[ 'id' ] + );
                switch (msg['msgid']) {
                    // Worker requested a chunk
                    case 0:
                        try {
                            bar.tick();

                            let readPromises = [],
                                db_data = [];

                            let keyPointerArray = db_keys[Object.keys(db_keys)[msg['msg']]];

                            // console.log("\nSecond try:");
                            // LevelDbWrapper.get(db_keys[Object.keys(db_keys)[0]][0], (err, value) => {
                            //     console.log(value);
                            // });

                            for (let i = 0; i < keyPointerArray.length; i++) {
                                // console.log(keyPointerArray[i]);

                                readPromises.push(new Promise((resolve, reject) => {
                                    LevelDbWrapper.get(keyPointerArray[i], (err, data) => {
                                        // console.log(data);
                                        db_data.push(data);
                                        resolve();
                                    });
                                }));
                            }

                            Promise.all(readPromises)
                                .then(function () {
                                    workers[worker["id"] - 1].send({ msgid: 0, msg: { xz: keyPointerArray[0].slice(0, 8), data: db_data } });
                                });
                        } catch (err) {
                            throw err;
                        }
                    break;

                    // Worker finished rendering
                    case 1:
                        finishedWorkers++;
                        // if (argv.verbose) { console.log('Thread ' + (worker['id'] - 1) + ' is done rendering.'); };
                        if (finishedWorkers === argv.threads) {
                            if (argv.verbose) { console.log('All threads are done rendering.'); }
                            processLeafletMap();
                        }
                    break;
                }
            });

            async function processLeafletMap() {
                // Generate additional zoom levels for Leaflet map
                const renderZoomLevel = require('./render/renderZoomLevel.js');

                let progressBars = {
                    zoomLevels: new ProgressBar(colors.bold('[') + ':bar' + colors.bold(']') + ' :percent\tRendering zoom levels\tCurrent zoom level:\t', {
                        total: Object.keys(db_keys).length,
                        complete: colors.inverse('='),
                        width: 32
                    })
                };

                renderZoomLevel(16, zoomLevelMax, chunkX, chunkZ)
                    .then(() => {
                        console.log('Successfully rendered all zoom levels!');
                        process.exit();
                    });
            }

            function prepareOutput() {
                if (!fs.existsSync(path_output)) {
                    fs.mkdirSync(path_output)
                }
                if (!fs.existsSync(path_output + '/map/')) {
                    fs.mkdirSync(path_output + '/map/');
                }

                // Create index.html
                // console.log('Preparing output directory...');
                let levelname = fs.readFileSync(path_leveldat + '/levelname.txt');

                const buildHTML = require('./html/buildHTML.js');
                buildHTML(path.normalize(path_output), 0, zoomLevelMax, 0, 0, levelname);
            }
        })();

        /*
        LevelDbWrapper.close(() => {

        });
        */
    }
} else {
    const readChunk = require('./db/readChunk.js');
    const renderChunk = require('./render/renderChunk.js');
    const Cache = require('./palettes/textureCache');

    let pos = process.env['start'],
        cache = new Cache(),
        worldOffset = JSON.parse(process.env['worldOffset']);

    initPromises = [];
    // Prepare essential images for cache
    // Monochrome textures blending colour
    initPromises.push(new Promise((resolve, reject) => {
        let img = vips.newImageBlack(16, 16);
        cache.save('mono_default', 0, img);
        cache.save('placeholder', 0, img);
        cache.save('blend_white', 0, img);
        cache.save('blend_black', 0, img);
        
        /*
        img = new PNG({ width: 1, height: 1 });
        cache.save('placeholder', 0, PNG.sync.write(img));

        img = new mapnik.Image(16, 16);
        img.fillSync(new mapnik.Color(255, 255, 255, 255, true));
        cache.save('blend_white', 0, img);

        img = new mapnik.Image(16, 16);
        img.fillSync(new mapnik.Color(0, 0, 0, 255, true));
        cache.save('blend_black', 0, img);
        */

        resolve();
    }));

    Promise.all(initPromises)
        .then(() => {
            // Initial chunk request
            process.send({ msgid: 0, msg: pos });
        })
        .catch((err) => {
        });

    // console.log( "I'm worker " + process.env[ 'ID' ] + ' and I render from ' + process.env[ 'start' ] + ' to ' + process.env[ 'end' ] );

    process.on('message', (msg) => {
        switch (msg['msgid']) {
            case 0: // Received requested chunk
                let chunk = new Chunk(Buffer.from(msg['msg']['xz']));
                // console.log( Buffer.from( msg[ 'msg' ][ 'xz' ] ) );

                for (let i = 0; i < msg['msg']['data'].length; i++) {
                    readChunk(Buffer.from(msg['msg']['data'][i]), chunk, i, process.env['yThreshold']);
                }

                renderChunk(chunk, cache, 16, worldOffset, zoomLevelMax)
                    .then(function () {
                        // Increment position counter
                        pos++;
                        // console.log( 'Thread ' + process.env[ 'ID' ] + ' ' + pos + '/' + process.env[ 'end' ] )

                        if (pos <= process.env['end']) {
                            process.send({ msgid: 0, msg: pos });
                        } else if (pos >= process.env['end']) {
                            process.send({ msgid: 1, msg: true }); // Process is done rendering their chunks
                        };

                    });
                break;
        };
    });
};