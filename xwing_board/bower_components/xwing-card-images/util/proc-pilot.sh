#!/bin/bash


tmp1=$(mktemp)
convert $1 -resize 300x418 $tmp1

tmp2=$(mktemp)
pngquant --force $tmp1 --output $tmp2

mv $tmp2 $1
rm $tmp1

