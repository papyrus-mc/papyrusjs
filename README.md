[![Build Status](https://travis-ci.org/clarkx86/papyrusjs.svg?branch=master)](https://travis-ci.org/clarkx86/papyrusjs) [![Discord](https://img.shields.io/discord/569841820092203011.svg?logo=discord&logoColor=white)](https://discord.gg/J2sBaXa)
# papyrus.js
Papyrus is a tool to render Minecraft: Bedrock Edition (from now on referenced as "MCBE") worlds using Leaflet. It is written in JavaScript and powered by node.js.

You can view an example [here](http://map.bedrock.clarkx86.com).
Please also check out papyrus.js' sister-project: [papyrus.cs](https://github.com/mjungnickel18/papyruscs/)!

## Introduction
Since MCBE worlds don't use the Anvil format like in the Java Edition, but rather a by Mojang [modified version](https://github.com/Mojang/leveldb-mcpe) of Google's [LevelDB](http://leveldb.org/) to save, the goal of Papyrus is to read these worlds and assemble a render of every pre-generated chunk.

## Features
- Render a top-down map of every already explored chunk
#### Planned
- Isometric renders
- Auto-Updating renders
- Live-View of currently online players on map (and their respective statistics)
- Nether/ The End support

([To-Do List](https://github.com/clarkx86/papyrusjs/blob/master/docs/todo.md#to-do-list))

## Installation
Assuming you have node.js installed, simply clone this repo and run the following command in your favourite terminal:

```npm install```

Requires node.js >= 8. Before installing, you may also need to install zlib using `sudo apt install zlib1g-dev`.

Otherwise, just grab one of the [pre-built binaries](https://github.com/clarkx86/papyrusjs/releases).

## Usage
```./papyrus --world="./My World/" --textures="./Vanilla_Resource_Pack" --output="./output" --mode="topdown_shaded"```

You are able to define a path to the texture pack you want to use for the final render. Vanilla textures will be automatically be downloaded if now textures are found. You can also force papyrus.js to download the latest textures with the option `--force-download`. If you want to download the vanilla resourcepack manually, you can get it [here](https://aka.ms/resourcepacktemplate).

[Read the full documentation.](https://github.com/clarkx86/papyrus/blob/master/docs/documentation.md)

## Contribute xor support
If you want to help improving Papyrus please consider forking the repository.

Want to buy me a coffee (I love coffee)? [Donate via PayPal ♥](https://paypal.me/clarkstuehmer)

## Special thanks to...
... [DeepBlue4200](https://github.com/mjungnickel18) and [mhsjlw](https://github.com/mhsjlw).

## Disclaimer
Papyrus is in no way affiliated with Mojang or Minecraft.

Contact: [clarkx86@outlook.com](mailto:clarkx86@outlook.com?subject=GitHub%20Papyrus)
