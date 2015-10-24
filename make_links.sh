#!/bin/bash
set -e
mkdir -p htdocs/media/{pic,pre}

for pic in `find ~/Hamsters -depth 1 -type d -regex '.*[0-9]'`
do
    echo 'linking' $pic
    ln -v -f -s $pic htdocs/media/pic
done

for pre in `find ~/Hamsters/pre -depth 1 -type d -regex '.*[0-9]'`
do
    echo 'linking' $pre
    ln -v -f -s $pre htdocs/media/pre
done
