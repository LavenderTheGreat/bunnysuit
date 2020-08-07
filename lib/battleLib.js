// BattleLib by SBHAX
// Utility library for working with Sonic Battle data.

// gets hex representation as string, with optional padding
function toHexString(number, pad){
    pad = pad || 0
    if (pad - number.toString(16).length > 0){
        return ("0".repeat(pad - number.toString(16).length) + number.toString(16))
    } else {
        return number.toString(16)
    }
}

// gets decimal representation from string
function toDec(number){
    return parseInt(number, 16)
}

// Reads a set of bytes in reverse, then returns it's number value
function readMoveOffset(file, offset, length){
    let toReturn = ""
    for (const byte of file.slice(offset, offset + length).reverse()){
        toReturn = toReturn + toHexString(byte, 2)
    }
    return parseInt(toReturn, 16) - 0x08000000 // All rom data pointers are offset (due to how gba ram works)
}

function parseMove(file, offset){
    
}

function reversePairs(string){
    // reverses a string like AABBCC to CCBBAA ie String to ngriSt
    let result = ""
    for (let i = string.length; i > -1; i -= 2) {
        // -1 is needed to get the last bit!
        result = result + string.slice(i, i+2)
    }
    return result
}

export {toHexString, toDec, readMoveOffset, reversePairs}