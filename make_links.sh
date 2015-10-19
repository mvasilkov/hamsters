#!/bin/bash
set -e
mkdir -p htdocs/media/{pic,pre}

for pic in `ls ~/Hamsters/*.{jpeg,png}`
do
    ln -f $pic htdocs/media/pic/
done

for pre in `ls ~/Hamsters/pre/*.png`
do
    ln -f $pre htdocs/media/pre/
done
