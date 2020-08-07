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
deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -output data.txt
```

Will return the following at data.txt:

```
// Sonic Idle 00
// Index 0 in the table 
// Originally pointed at 52F7C

00 00 F0 FF 00 00 00 10 00 04 1F 00 00 00 10 00 00 00 02 00 10 00 12 00 D0 00 11 00 18 00 33 00 B4 00 34 00 00 00 24 00 03 00 F0 FF 01 00 00 10 06 00 F0 FF 02 00 00 10 08 00 F0 FF 03 00 00 10 0A 00 F0 FF 04 00 00 10 0C 00 F0 FF 05 00 00 10 0D 00 F0 FF 00 00 FE FF

// Sonic Running 01
// Index 1 in the table
// Originally pointed at 52FD4

00 00 F0 FF 00 02 10 00 10 00 12 00 D0 00 11 00 80 07 1F 00 18 00 33 00 B4 00 34 00 00 00 24 00 08 00 00 10 04 00 F0 FF 0C 00 00 10 62 02 00 28 06 00 F0 FF 0D 00 00 10 08 00 F0 FF 0E 00 00 10 0A 00 F0 FF 0F 00 00 10 0C 00 F0 FF 10 00 00 10 0E 00 F0 FF 11 00 00 10 10 00 F0 FF 12 00 00 10 12 00 F0 FF 13 00 00 10 13 00 F0 FF 02 00 F0 00
```

### Loading patches

```
Index 0
// 0x52F7C Idle 00
00 00 F0 FF 00 00 00 10 00 04 1F 00 00 00 10 00 00 00 02 00 10 00 12 00 D0 00 11 00 18 00 33 00 B4 00 34 00 00 00 24 00 03 
00 F0 FF 01 00 00 10 06 
00 F0 FF 02 00 00 10 08 
00 F0 FF 03 00 00 10 0A 
00 F0 FF 04 00 00 10 0C 
00 F0 FF 05 00 00 10 0D 
00 F0 FF 00 00 FE FF // (Normal Loop)
```

Patches should be stored in a format where their bytes are written as hex as a SBP file in a folder. SBP files are text files that store hex in order optionally with gaps, comments also exist in SBP, with anything after ``//`` on a line being ignored, ie the file above becomes:

```
0000F0FF0000001000041F00000010000000020010001200D000110018003300B4003400000024000300F0FF010000100600F0FF020000100800F0FF030000100A00F0FF040000100C00F0FF050000100D00F0FF0000FEFF
```

As bytes, alternatively, you can store your patch data as bin files, which are more compact but harder to read.

SBP files also include their index always as line 1, which means they can have better names (ie Sonic Idle instead of 0).

It's recommended to use SBP files.

If you wished to replace Sonic's idle, you'd check in the dumped file for where your desired pointer is (ours is index 0), you'd put in your data to replace as a SBP text file, with the index on the first line as ``0`` in the folder and name it what you want ie ``Sonic Stand.sbp`` or alternatively, if it was a bin file, if should be named ``0.bin``.

### Patching data

```
deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -patch patch -output SONICBATTLE_patch.gba
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

### Mods folder

For consumers, bunnysuit includes support for a mods folder argument to apply multiple patches as one:

```
deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -mods modsfolder -output SONICBATTLE_patch.gba
```

This is functionally identical to patch except iteratively uses files in subdirectories.