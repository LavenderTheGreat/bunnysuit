// MoveTool by SBHax

import * as battleLib from "./lib/battleLib.js"

const indexold = {
    movesStart: battleLib.toDec("ED68A8"),
    movesCount: 1//1399
}

const index = JSON.parse(Deno.readTextFileSync("index.json"))

var patch = {}

var setting = {
    mode: "dump",
}

// Parse input arguments

for (let i = 0; i < Deno.args.length; i++){
    switch (Deno.args[i]){
        case "-help":
            console.log(`
Bunnysuit - A tool by Lavenfurr
Moveset pointer patcher and dumper for Sonic Battle (US)

Command examples: 

- Dumping data
    - deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -output data.json

- Patching data
    - deno run --allow-net --allow-read --allow-write bunny.js -rom SONICBATTLE.gba -patch patch -output SONICBATTLE_patch.gba
`)
            break;

        case "-rom":
            setting.input = Deno.args[i + 1]
            console.log("Input file: " + setting.input)
            i++ // Skip the next arg too
            break;

        case "-output":
            setting.output = Deno.args[i + 1]
            console.log("Output file: " + setting.output)
            i++
            break;

        case "-patch":
            setting.patch = Deno.args[i + 1]
            console.log("Patch file: " + setting.patch)
            setting.mode = "patch"
            patch = JSON.parse(Deno.readTextFileSync(Deno.args[i+1]))
            i++
            break;
    }
}

// Check for errors within them

if (setting.input == undefined){
    throw('No input file provided!')
}

if (setting.output == undefined){
    throw('No output file provided!')
}

// Now run

const file = Deno.readFileSync(setting.input)

switch(setting.mode){
    case "dump":
        for (let i = 0; i < index.movesCount; i++){
            // Get move offset from encoded offset
            const offset = battleLib.readMoveOffset(file, index.start + (index.addressLength*i), index.addressLength)
            if (offset < 0){
                // move is invalid
                console.log("Move index " + i + " is invalid. This is PERFECTLY NORMAL on real ROMs in a good amount of cases.")
            } else {
                // move is valid
                console.log("Reading move at " + offset.toString(16) + " (Move number " + i + ")...")
            }
        }
        break;
        
    case "patch":
        // current data offset
        const currentOffset = index.emptyStart // convert index from string!

        // Iterate over patch patches 
        for (const currentPatch of patch){
            // convert move data to bytes

            // insert movedata at currentoffset

            // change pointer at index to currentoffset converted to the format

            // add length of movedata to currentoffset

            // next
        }
        break;
}