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
Index 0 (ED68A8) - Originally pointed at 52F7C - Sonic Idle 00
Index 1 (ED68AC) - Originally pointed at 52FD4 - Sonic Idle 01
...
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

As a bytestring.

SBP files also include their index always as line 1, which means they can have better names (ie Sonic Idle instead of 0).

It's recommended to use SBP files.

If you wished to replace Sonic's idle, you'd check in the dumped file for where your desired pointer is (ours is index 0), you'd put in your data to replace as a SBP text file, with the index on the first line as ``0`` in the folder and name it what you want ie ``Sonic Stand.sbp``.

### Patching data

```
deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -patch patch -output SONICBATTLE_patch.gba
```

Will update the specified ROM with the patch file, then output it where specified. **Merge your patches.** It's as simple as copy paste.

### Mods folder

For consumers, bunnysuit includes support for a mods folder argument to apply multiple patches as one:

```
deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -mods modsfolder -output SONICBATTLE_patch.gba
```

This is functionally identical to patch except iteratively uses files in subdirectories.