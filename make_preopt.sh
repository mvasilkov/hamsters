#!/bin/bash
set -e

PNGOUT=./bin/pngout-*

for png in `find ~/Hamsters/pre -depth 2 -type f -name '*.png'`
do
    echo 'optimize' $png
    $PNGOUT $png
done
