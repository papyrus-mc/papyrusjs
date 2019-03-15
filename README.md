# Papyrus
Papyrus is a tool to render Minecraft: Bedrock Edition (from now on referenced as "MCBE") worlds using Leaflet. It is written in JavaScript and powered by node.js.

## Introduction
MCBE worlds don't use the Anvil format like in the Java Edition, but rather a by Mojang [modified version](https://github.com/Mojang/leveldb-mcpe) of Google's [LevelDB](http://leveldb.org/) to save.
Papyrus can read these worlds and assemble a render of every pre-generated chunk.

## Dependencies
- [PureImage](https://www.npmjs.com/package/pureimage)
- [NBT.js](https://www.npmjs.com/package/nbt)
- [level](https://www.npmjs.com/package/level)
- [zlib](https://www.npmjs.com/package/zlib)

## Building
If you have node.js installed, you can just simply run
```node app.js```
to execute Papyrus. Would you want to build a standalone binary however, you can use solutions like [Pkg](https://github.com/zeit/pkg). A build script for building with Pkg is provided alongside the main application. You can build Papyrus by executing ```node build.js```, assuming all of the dependencies that are mentioned above are installed.
