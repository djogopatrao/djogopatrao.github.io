#!/bin/bash


tmp1=$(mktemp)
convert $1 -resize 194x300 $tmp1

tmp2=$(mktemp)
pngquant --force $tmp1 --output $tmp2

mv $tmp2 $1
rm $tmp1

