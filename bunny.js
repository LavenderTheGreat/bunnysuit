// MoveTool by SBHax

import * as battleLib from "./lib/battleLib.js"

const indexold = {
    movesStart: battleLib.toDec("ED68A8"),
    movesCount: 1//1399
}

const index = JSON.parse(Deno.readTextFileSync("index.json"))

const comments = JSON.parse(Deno.readTextFileSync("comments.json"))

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

// Check for errors within them

if (setting.input == undefined){
    throw('No input file provided!')
}

if (setting.output == undefined){
    throw('No output file provided!')
}

// Now run

let rom = Deno.readFileSync(setting.input)

switch(setting.mode){
    case "dump":
        let result = ""

        // Iterate over moves listed
        for (let i = 0; i < index.length; i++){ //index.length
            const address = {
                number: parseInt(index.start, 16) + (i*4),
                string: battleLib.toHexString(parseInt(index.start, 16) + (i*4), 8),
            }
            
            let currentValue = ""

            // Attach bytes together
            for (let x = 3; x > -1; x-=1){
                let current = address.number + x
                currentValue = currentValue + battleLib.toHexString(rom[current], 2)
            }

            // Subtract, convert them back

            currentValue = battleLib.toHexString(parseInt(currentValue, 16) - 0x08000000, 8)

            // Find a comment that matches the current address

            let currentComment = {}

            for (const comment of comments){
                if ((comment.index != undefined && comment.index == i) || (comment.address != undefined && comment.address == address.string) || (comment.value != undefined && comment.value.toLowerCase() == currentValue.toLowerCase())){
                    currentComment = comment
                }
            }

            // Append the address
            result = result + (`Index ${i} (${address.string}) - Originally pointed at ${currentValue} - ${currentComment.comment || "Unknown"}
`)

        }

        Deno.writeTextFileSync(setting.output, result)
        console.log("Written!")

        break;
        
    case "patch":
        // current data offset
        console.log(index.emptyStart)
        let currentOffset = parseInt(index.emptyStart, 16) // convert index from string!

        // Iterate over patch folders
        for (const patch of patches){
            // Iterate over patch files
            for (const file of Deno.readDirSync(patch)){

                if (file.name.toLowerCase().endsWith(".sbp") && !file.isDirectory) {
                    // If it's a patch file and not a directory.

                    // Read file, store name, preparation work.
                    let data = Deno.readTextFileSync(patch + file.name)

                    const patchName = patch + file.name

                    console.log("Parsing patch " + patchName + "...")

                    // Split into lines
                    data = data.split(/[\r\n]+/)

                    let parsedData = "" // Data when parsed into a string of bytes ie no comments, no first line, added to.

                    // Where we store the pointer address to overwrite
                    let pointerAddresses = []

                    // iterate over lines
                    for (var line of data) {
                        // Remove any comments
                        line = line.split("//")[0] 

                        if (line.startsWith("Index ")) {
                            // remove prefix, use it as the address after adding it to the start
                            pointerAddresses.push(parseInt(index.start, 16) + (parseInt(line.slice(6).trim())*4))

                        } else if (line.startsWith("Address ")) {
                            // Set the address
                            pointerAddresses.push(parseInt(line.slice(8).trim(), 16))

                        } else {
                            // Just a byte line, not an index pointer, just remove junk from it.

                            line = line.replace(/[^A-Fa-f0-9]/g, "") // Remove non hex characters on the line

                            // Add to parsed data
                            parsedData = parsedData + line
                        }
                    }

                    // Write into the file

                    console.log("Writing patch " + patchName + " to empty space...")

                    // Overwrite our bytes in the file
                    for (let i = 0; i < parsedData.length; i+= 2){
                        // Offset + bit in data chunk (has to be div by 2 since we're working in pairs) = current byte
                        rom[currentOffset + (i/2)] = parseInt(parsedData[i] + parsedData[i + 1], 16)
                    }

                    // Write our pointer into the file

                    console.log("Writing pointer to patch " + patchName + "...")

                    // Target address to point at
                    let address = battleLib.toHexString(currentOffset + 0x08000000, 8) // 0x08000000 is an offset for the gba to read from ROM

                    console.log("Address (Raw): " + address)
                    address = battleLib.reversePairs(address)
                    console.log("Address (ROM Format): " + address)

                    // Write the pointers into file

                    for (var pointer = 0; pointer < pointerAddresses.length; pointer++){
                        console.log("Writing pointer at " + battleLib.toHexString(pointerAddresses[pointer], 8) + "... (" + (pointer + 1) + "/" + pointerAddresses.length + ")")
                        for (let i = 0; i < 8; i+= 2){
                            // Table offset + index + bit in data chunk (has to be div by 2 since we're working in pairs) = current byte
                            rom[pointerAddresses[pointer] + i/2] = parseInt(address[i] + address[i + 1], 16)
                        }
                    }

                    console.log("Written patch!")

                    // Update current offset

                    currentOffset = currentOffset + (parsedData.length / 2) // Parsed data is just the pairs for bytes, so we can divide it by two to get byte length.
                }
            }
        }

        Deno.writeFileSync(setting.output, rom)
        break;
}