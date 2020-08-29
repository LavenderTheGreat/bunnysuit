# Animdata

Bunnysuit's primary application is to patch animdata in Sonic Battle. Animdata has a moderately complex format but can be easily understood by splitting it up and understanding the inner workings of a frame. As of current, this document covers what we know of the data and doesn't currently list everything.

| Table of Contents |
|:------------------|
| <div><ul> <li> <a href="#An-introduction">An introduction</a> </li> <li> <a href="#In-detail">In detail</a> </li> </ul></div> |

## An introduction

It's worth thinking of animdata as a timeline of keyframes, with durations, similar to an animation (because they are animations). ie, for Sonic's punch:

| Ends at (Frames) | Frame index | Bonus information |
|:-------:|:-----------:|:-----------------:|
| 1 | ``0x40`` | Has animation initialisation data |
| 2 | ``0x41``
| 4 | ``0x42`` | Extended frame
| 6 | ``0x43``
| 8 | ``0x44`` | Extended frame
| 10 | ``0x45``

Each frame at least has an image tied to it and an end time, alongside a type. The only exception to any of these is the end frame types, which lack images and end times (As they stop the animation).

## In detail

> NOTE: This section is and will be for a long time, ***incomplete***. You can help by experimenting with unknown data and reporting results in the SBHAX Discord. If you utilise the information below, we urge you to give back to the community by doing the former.

### Standard frames

A standard frame looks typically like the following:

``00 F0 FF 41 00 00 10 02``

They can be split up like so:

| Bytes | Purpose | Notes |
|:-----:|:-------:|:-----:|
| ``00 F0 FF`` | Indicates the beginning of a frame | 
| ``41 00`` | Frame index in reversed bytes, ie ``00 01`` is frame 256 (``01 00``)
| ``00 10`` | **Unknown** | This byte sequence is present in all short frames but not in extended frames. Also in initialisation frames.
| ``02`` | Frame index to display

These frames are extremely common but not entirely flexible. They lack hitboxes, offsets and any movement.

### Extended frames (EFrames)

#### Examples:

``00 F0 FF 40 01 20 00 00 00 21 00 00 00 22 00 24 00 23 00 D0 00 24 00 05 00 27 00 01 00 25 00 02 00 26 00 42 00 00 10 04`` - *Sonic Punch One - EFrame 1*

``00 F0 FF 00 00 24 00 44 00 00 10 00 00 20 01 08`` - *Sonic Punch One - EFrame 2*

Extended frames start with the same initialisation bytes as a standard frame but usually deviate straight after. There seems to be somewhat of a pattern with the first two bytes maybe being types, as ``00 00`` seems to always appear in the latter EFrame of an attack and ``40 01`` always seems to appear in the earlier frame (As far as we know, the damage frame.)

> **TODO**: Finish this.

### Special case frames

#### The first frame

The first frame of an animation always starts with it's first ``00`` byte doubled, ie it becomes ``00 00 F0 FF`` instead of ``00 F0 FF``, as it is between frames.

#### Terminating frames

The terminating frame of an animation, ie the last frame, will use the standard ``00 F0`` of a frame start, but will then use ``00`` instead of ``FF`` to signify the end of an animation, ie ``00 F0 00``