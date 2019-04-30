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

Requires Node.js 8. You may also need to install and configure [additional dependencies](https://github.com/clarkx86/papyrusjs#additional-dependencies).

Otherwise, just grab one of the [pre-built binaries](https://github.com/clarkx86/papyrusjs/releases).

## Usage
```papyrus --path "My World" --textures "Vanilla_Resource_Pack.zip" --output "C:\papyrus" --mode papyrus```

You'll have to define a path to the texture pack you want to use for the final render. If you with to automatically download the vanilla textures, run papyrus with the ```--download-texture``` option. The vanilla resource pack with the default textures can also be downloaded from [here](https://aka.ms/resourcepacktemplate).

[Read the full documentation.](https://github.com/clarkx86/papyrus/blob/master/docs/documentation.md)

## Contribute xor support
If you want to help improving Papyrus please consider forking the repository.

Want to buy me a coffee (I love coffee)? [Donate via PayPal ♥](https://paypal.me/clarkstuehmer)

## Special thanks to...
... [DeepBlue4200](https://github.com/mjungnickel18) and [mhsjlw](https://github.com/mhsjlw).

## Disclaimer
Papyrus is in no way affiliated with Mojang or Minecraft.

Contact: [clarkx86@outlook.com](mailto:clarkx86@outlook.com?subject=GitHub%20Papyrus)
