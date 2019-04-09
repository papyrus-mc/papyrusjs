# Papyrus.JS
Papyrus is a tool to render Minecraft: Bedrock Edition (from now on referenced as "MCBE") worlds using Leaflet. It is written in JavaScript and powered by node.js.

You can view an example [here](http://papyrus.clarkx86.com/map).

## Introduction
Since MCBE worlds don't use the Anvil format like in the Java Edition, but rather a by Mojang [modified version](https://github.com/Mojang/leveldb-mcpe) of Google's [LevelDB](http://leveldb.org/) to save, the goal of Papyrus is to read these worlds and assemble a render of every pre-generated chunk.

## Features
- Render a top-down map of every already explored chunk
### Planned
- Isometric renders
- Auto-Updating renders
- Live-View of currently online players on map (and their respective statistics)

## Installation
Assuming you have node.js installed, simply clone this repo and run the following command in your favourite terminal:

```npm install```

Otherwise, just grab one of the [pre-built binaries](https://github.com/clarkx86/papyrus#building-a-standalone).

## Usage
```papyrus --path "My World" --textures "Vanilla_Resource_Pack.zip" --output "C:\papyrus" --mode papyrus```

You'll have to define a path to the texture pack you want to use for the final render. The vanilla resource pack with the default textures can be downloaded from [here](https://aka.ms/resourcepacktemplate).

[Read the full documentation.](https://github.com/clarkx86/papyrus/blob/master/docs/documentation.md)

## Additional dependencies
- [node-leveldb-mcpe](https://github.com/mhsjlw/node-leveldb-mcpe)

All other dependencies can be acquired by [installing](https://github.com/clarkx86/papyrus#installation).

## Building a standalone
If you have node.js installed, you can just simply run
```node app.js```
to execute Papyrus. Would you want to build a standalone binary however, you can use solutions like [Pkg](https://github.com/zeit/pkg). A build script for building with Pkg is provided alongside the main application. You can build Papyrus by executing ```node build.js```, assuming all of the dependencies that are mentioned above are installed.

You can find pre-built binaries (containing all dependencies for your platform) [here](http://papyrus.clarkx86.com/download) or [here](https://github.com/clarkx86/papyrus/releases).

## Contribute xor support
If you want to help improving Papyrus please consider contributing.

Want to buy me a coffee (I love coffee)? [Donate via PayPal ♥](https://paypal.me/clarkstuehmer)

## Disclaimer
Papyrus is in no way affiliated with Mojang or Minecraft.

Contact: [clarkx86@outlook.com](mailto:clarkx86@outlook.com?subject=GitHub%20Papyrus)
