# Papyrus
Papyrus is a tool to render Minecraft: Bedrock Edition (from now on referenced as "MCBE") worlds using Leaflet.

MCBE worlds don't use the Anvil format like in the Java Edition, but rather a by Mojang [modified version](https://github.com/Mojang/leveldb-mcpe) of Google's [LevelDB](http://leveldb.org/) to save.
Papyrus can read these worlds and assemble a render of every pre-generated chunk.

## Dependencies
- [PureImage](https://www.npmjs.com/package/pureimage)
- [NBT.js](https://www.npmjs.com/package/nbt)
- [level](https://www.npmjs.com/package/level)
- [zlib](https://www.npmjs.com/package/zlib)
