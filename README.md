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

## Other useful resources

- [Address list](https://github.com/LavenderTheGreat/bunnysuit/blob/master/addresslist.md) - Contains pointers and comments on many addresses and moves.

## Usage

> It's worth noting there are two example batch files included with this which may be enough for most people. They assume there's a file named ``SONICBATTLE.gba`` in the folder (case sensitive) alongside a folder named ``mods`` and they do the following:
>
> - ``example_dump.bat`` - Dumps a txt with addresses, maybe useful for someone.
>
> - ``example_mods.bat`` - Writes mods to a rom and outputs it as SONICBATTLE_MODDED.gba.
>
> These should be sufficient for most people.

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

SBP files also include their index as line 1 (usually, but you can put it on line 2 or wherever too), which means they can have better names (ie Sonic Idle instead of 0). Alongside indexes, they can use addresses through ``Address`` on a line.

It's recommended to use SBP files.

If you wished to replace Sonic's idle, you'd check in the dumped file for where your desired pointer is (ours is index 0), you'd put in your data to replace as a SBP text file, with the index on the first line as ``0`` in the folder and name it what you want ie ``Sonic Stand.sbp``.

### Patching data

```
deno run --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -patch patch -output SONICBATTLE_patch.gba
```

Will update the specified ROM with the patch file, then output it where specified. **Merge your patches.** It's as simple as copy paste.

### Mods folder

For consumers, bunnysuit includes support for a mods folder argument to apply multiple patches as one:

```
deno run --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -mods modsfolder -output SONICBATTLE_patch.gba
```

This is functionally identical to patch except iteratively uses files in subdirectories.

## SBP documentation

SBP stands for Sonic Battle Patch, it's a format that allows a user to write patches for movesets with comments on the framedata, which makes modding substantially easier. Also allows newlines and similar. The best way to understand SBP is how the program interprets it:

### Compiling to bytes

- BunnySuit ignores:

    - Lines under the following conditions:

        - Starts with a pointer keyword (Index or Address)

    - Anything beyond a comment indicator (`//`) and also the indicator itself

    - Anything not in the hexadecimal range (0-9, A-F, a-f) including new lines and spaces.

An example: 

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

Remove keyword lines:

```
// 0x52F7C Idle 00
00 00 F0 FF 00 00 00 10 00 04 1F 00 00 00 10 00 00 00 02 00 10 00 12 00 D0 00 11 00 18 00 33 00 B4 00 34 00 00 00 24 00 03 
00 F0 FF 01 00 00 10 06 
00 F0 FF 02 00 00 10 08 
00 F0 FF 03 00 00 10 0A 
00 F0 FF 04 00 00 10 0C 
00 F0 FF 05 00 00 10 0D 
00 F0 FF 00 00 FE FF // (Normal Loop)
```

Remove comments:

```
00 00 F0 FF 00 00 00 10 00 04 1F 00 00 00 10 00 00 00 02 00 10 00 12 00 D0 00 11 00 18 00 33 00 B4 00 34 00 00 00 24 00 03 
00 F0 FF 01 00 00 10 06 
00 F0 FF 02 00 00 10 08 
00 F0 FF 03 00 00 10 0A 
00 F0 FF 04 00 00 10 0C 
00 F0 FF 05 00 00 10 0D 
00 F0 FF 00 00 FE FF 
```

Remove anything not hex:

```
0000F0FF0000001000041F00000010000000020010001200D000110018003300B4003400000024000300F0FF010000100600F0FF020000100800F0FF030000100A00F0FF040000100C00F0FF050000100D00F0FF0000FEFF
```

### Pointer keywords

Pointers can be referred to in two ways from an SBP, their index from the pointer table start (Legacy) or the pointer address (Use this!), they look like the following:

```
Index 0 // Index 0 from pointer origin
Address 000000 // Pointer starting at 000000
```

### Finding pointers

With the advent of the advanced, strict dumper, there is now an address list available **[here](https://github.com/LavenderTheGreat/bunnysuit/blob/master/addresslist.md).**