// MoveTool by SBHax

import * as battleLib from "./lib/battleLib.js"

const indexold = {
    movesStart: battleLib.toDec("ED68A8"),
    movesCount: 1//1399
}

const index = JSON.parse(Deno.readTextFileSync("index.json"))

var patches = []

var setting = {
    mode: "dump",
}

// Deno.readDirSync(directoryToScan)

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
            patches.push(Deno.args[i+1] + "/")
            i++
            break;

        case "-mods":
            console.log("Mods folder: " + Deno.args[i+1])
            setting.mode = "patch"
            for (const mod of Deno.readDirSync(Deno.args[i+1] + "/")){
                if (mod.isDirectory){
                    console.log("Patch in " + Deno.args[i+1] + ": " + mod.name)
                    patches.push(Deno.args[i+1] + "/" + mod.name + "/")
                }
            }
            i++
            break;
    }
}

//console.log(patches)

// Check for errors within them

if (setting.input == undefined){
    throw('No input file provided!')
}

if (setting.output == undefined){
    throw('No output file provided!')
}

// Now run

//const file = Deno.readFileSync(setting.input)

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
        console.log(index.emptyStart)
        let currentOffset = parseInt(index.emptyStart, 16) // convert index from string!

        let rom = Deno.readFileSync(setting.input)

        // Iterate over patch indexes
        for (const patch of patches){
            for (const file of Deno.readDirSync(patch)){
                //console.log(patch + file.name)

                let data = Deno.readTextFileSync(patch + file.name)

                const patchName = patch + file.name

                console.log("Parsing patch " + patchName + "...")

                // Split into lines
                data = data.split(/[\r\n]+/)

                let parsedData = "" // Data when parsed into a string of bytes ie no comments, no first line

                let moveIndex = undefined

                // iterate over lines
                for (var line of data) {
                    line = line.split("//")[0] // Remove any comments

                    if (line.startsWith("Index ")) {
                        moveIndex = parseInt(line.slice(6)) // remove prefix, use it as index
                    } else {
                        // Just a byte line, not an index pointer

                        line = line.replace(/[^A-Fa-f0-9]/g, "") // Remove non hex characters on the line

                        parsedData = parsedData + line
                    }
                }
                
                //console.log(parsedData)

                // Write into the file

                console.log("Writing patch " + patchName + " to empty space...")

                for (let i = 0; i < parsedData.length; i+= 2){
                    // Offset + bit in data chunk (has to be div by 2 since we're working in pairs) = current byte
                    //console.log((parsedData[i] + parsedData [i+1]) + " - " + parseInt(parsedData[i] + parsedData[i + 1], 16))
                    rom[currentOffset + (i/2)] = parseInt(parsedData[i] + parsedData[i + 1], 16)
                }

                // Write our pointer into the file

                console.log("Writing pointer to patch " + patchName + "...")

                let address = battleLib.toHexString(currentOffset + 0x08000000, 8) // 0x08000000 is an offset for the gba to read from ROM

                console.log("Address (Raw): " + address)
                address = battleLib.reversePairs(address)
                console.log("Address (ROM Format): " + address)

                for (let i = 0; i < 8; i+= 2){
                    // Table offset + index + bit in data chunk (has to be div by 2 since we're working in pairs) = current byte
                    //console.log("Byte: " + address[i] + address[i + 1])
                    rom[parseInt(index.start, 16) + (moveIndex*4) + i/2] = parseInt(address[i] + address[i + 1], 16)
                }

                console.log("Written patch!")

                // Update current offset

                currentOffset = currentOffset + (parsedData.length / 2) // Parsed data is just the pairs for bytes, so we can divide it by two to get byte length.
            }
        }

        Deno.writeFileSync(setting.output, rom)
        break;
}