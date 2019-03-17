# Papyrus
Papyrus is a tool to render Minecraft: Bedrock Edition (from now on referenced as "MCBE") worlds using Leaflet. It is written in JavaScript and powered by node.js.

## Introduction
Since MCBE worlds don't use the Anvil format like in the Java Edition, but rather a by Mojang [modified version](https://github.com/Mojang/leveldb-mcpe) of Google's [LevelDB](http://leveldb.org/) to save, the goal of Papyrus is to read these worlds and assemble a render of every pre-generated chunk.

## Features
- Render a top-down map of every already explored chunk
### Planned
- Isometric renders
- Auto-Updating renders
- Live-View of currently online players on map (and their respective statistics)

## Usage
```papyrus --path "My World" --output "C:\papyrus" --mode papyrus```

## Dependencies
- [cli-spinner](https://www.npmjs.com/package/cli-spinner)
- [Colors](https://www.npmjs.com/package/colors)
- [node-leveldb-mcpe](https://github.com/mhsjlw/node-leveldb-mcpe)
- [prismarine-chunk](https://www.npmjs.com/package/prismarine-chunk)
- [Prismarine-NBT](https://www.npmjs.com/package/prismarine-nbt)
- [PureImage](https://www.npmjs.com/package/pureimage)
- [vec3](https://www.npmjs.com/package/vec3)
- [Yargs](https://www.npmjs.com/package/yargs)
- [zlib](https://www.npmjs.com/package/zlib)

## Building a standalone
If you have node.js installed, you can just simply run
```node app.js```
to execute Papyrus. Would you want to build a standalone binary however, you can use solutions like [Pkg](https://github.com/zeit/pkg). A build script for building with Pkg is provided alongside the main application. You can build Papyrus by executing ```node build.js```, assuming all of the dependencies that are mentioned above are installed.

You can find pre-built binaries (containing all dependencies for your platform) from [here](http://papyrus.clarkx86.com/download) or [here](https://github.com/clarkx86/papyrus/releases).

## Disclaimer
Papyrus is in no way affiliated with Mojang or Minecraft.

Contact: [clarkx86@outlook.com](mailto:clarkx86@outlook.com?subject=GitHub%20Papyrus)
