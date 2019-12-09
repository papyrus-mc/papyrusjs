[![Build Status](https://travis-ci.com/clarkx86/papyrusjs.svg?branch=master)](https://travis-ci.com/clarkx86/papyrusjs) [![Discord](https://img.shields.io/discord/569841820092203011.svg?logo=discord&logoColor=white)](https://discord.gg/J2sBaXa)
# papyrus.js
<html>
    <body>
        <div style="text-align: center;">
            <hr>
            <h4>Just looking for the download? <a href="https://github.com/clarkx86/papyrusjs/releases/latest">Click here</a>!</h4>
            <hr>
        </div>
    </body>
</html>
Papyrus is a tool to render Minecraft: Bedrock Edition (from now on referenced as "MCBE") worlds using Leaflet. It is written in JavaScript and powered by node.js.

You can view an example [here](http://map.bedrock.clarkx86.com/demo).

**Please also check out papyrus.js' sister-project: [papyrus.cs](https://github.com/mjungnickel18/papyruscs/)!**

## Introduction
Since MCBE worlds don't use the Anvil format like in the Java Edition, but rather a by Mojang [modified version](https://github.com/Mojang/leveldb-mcpe) of Google's [LevelDB](https://github.com/google/leveldb) to save, the goal of Papyrus is to read these worlds and assemble a render of every pre-generated chunk.

## Features
- Render a top-down map of every already explored chunk
##### Planned
- Windows support
- Isometric renders
- Auto-Updating renders
- Live-View of currently online players on map (and their respective statistics)
- Nether/ The End support

## Installation
Do you just want to *use* papyrus.js (or don't want to build it from scratch)? You may be looking for the [pre-built binaries](https://github.com/clarkx86/papyrusjs/releases).

Before installing, you may also need to install additional dependencies:
```sudo apt install g++ zlib1g-dev```

Assuming you have node.js (>= 12) already installed, simply clone this repository and run the following command in your favourite terminal:
```npm install```

## Usage
```./papyrus --world="./My World/" --textures="./Vanilla_Resource_Pack" --output="./output" --mode="topdown_shaded"```

You are able to define a path to the texture pack that you want to use for the final render. Vanilla textures will automatically be downloaded if no textures are found. You can also force papyrus.js to download the latest textures with the option `--force-download`. If you want to download the vanilla resourcepack manually, you can get it [here](https://aka.ms/resourcepacktemplate).

**Please note:** Only 16x16px *Bedrock Edition* texture packs are supported!

## Contribute xor support
If you want to help improving Papyrus please consider forking the repository.

Want to buy me a coffee (I love coffee)? [Donate via PayPal ♥](https://paypal.me/clarkstuehmer)

## Special thanks to...
... [DeepBlue4200](https://github.com/mjungnickel18), [mhsjlw](https://github.com/mhsjlw) and all the contributors.

## Disclaimer
Papyrus is in no way affiliated with Mojang or Minecraft.

Contact: [papyrus@clarkx86.com](mailto:papyrus@clarkx86.com?subject=GitHub%20Papyrus)