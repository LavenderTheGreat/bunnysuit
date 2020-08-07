<!--<p align="center">
    <img src="logo.png">
    <h4 align="center">Art by </h4>
</p>-->

# Bunnysuit

Moveset pointer patcher and dumper for Sonic Battle (US).

## Features

- Reads THQ/Sonic GBA style pointers.

- Patches data losslessly to the end of a ROM to prevent overwrites.

- Utilises a 'data' file which can be used to annotate pointer indexes.

## Usage

### Dumping data

```
deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -output data.json
```

Will return the following at data.json:

```json
[
    {
        "index": 0,
        "pointer":"52F7C",
        "data":"00 00 F0 FF 00 00 00 10 00 04 1F 00 00 00 10 00 00 00 02 00 10 00 12 00 D0 00 11 00 18 00 33 00 B4 00 34 00 00 00 24 00 03 00 F0 FF 01 00 00 10 06 00 F0 FF 02 00 00 10 08 00 F0 FF 03 00 00 10 0A 00 F0 FF 04 00 00 10 0C 00 F0 FF 05 00 00 10 0D 00 F0 FF 00 00 FE FF",
        "comment":"Sonic Idle 00"
    },
    ...
]
```

- ``index`` - Index of the pointer.
- ``pointer`` - Address the pointer contains. Works as a comment.
- ``data`` - Data the address points to. May not be returned on certain things, please extract them yourself.
- ``comment`` - Comment if the source file contains it. Works as a comment.

### Creating a patch file

```json
[
    {
        "index": 0,
        "data":"00 00 F0 FF 00 00 00 10 00 04 1F 00 00 00 10 00 00 00 02 00 10 00 12 00 D0 00 11 00 18 00 33 00 B4 00 34 00 00 00 24 00 03 00 F0 FF 01 00 00 10 06 00 F0 FF 02 00 00 10 08 00 F0 FF 03 00 00 10 0A 00 F0 FF 04 00 00 10 0C 00 F0 FF 05 00 00 10 0D 00 F0 FF 00 00 FE FF"
    }
]
```

Patches only need the necessary data (**And cannot refer to the index of a pointer by it's target address**). This will add data to the end of the ROM (in the empty space).

### Patching data

```
deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -patch patch.json -output SONICBATTLE_patch.gba
```

Will update the specified ROM with the patch file, then output it where specified. **Merge your patches.** It's as simple as copy paste.

### Creating an index file

Index files must be in json format and look like the following:

```json
{
    "addressLength": 4,
    "reverseBytes": true,
    "start":"ED68A8",
    "length": 1399,
    "dumpData": false
}
```

- ``addressLength`` - Length of a pointer in bytes.
- ``reverseBytes`` - Whether bytes should be reversed when importing/exporting pointer data. For THQ/Sonic Advance games.
- ``start`` - Where the pointer table starts.
- ``length`` - Length in pointers of the table.
- ``dumpData`` - Whether to dump all data from the current byte to the next pointer's byte. This is useful for some things but not for others.

Index files must be called index.json to be detected.