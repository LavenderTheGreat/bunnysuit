# battleLib

battleLib is a Deno library for working with common formats of data in Sonic Battle, alongside utilities.

### Notes

- Offsets are expected as strings and returned as strings.

    - The library provides a quick shorthand for converting to these, ``toHex(number)`` and it's inverse, ``toDec``.

    - This is because it's how they are written and the state of bytes can be important when returned and editted (ie for reversal)

### Functions

- ``readReverse(offset, length)`` - Allows you to reverse sets of bytes like how the game reads them under certain circumstances (Palettes, pointers).