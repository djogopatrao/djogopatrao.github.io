#!/bin/bash
find bower_components/xwing-card-images/ -name *.png | perl -e '@p=();@u=();while(<STDIN>){chomp;$l=$_;@a = split/\//g; $n = pop @a; $d= $a[3]; $n =~ s/.png//g; $tmp="\"$n\": \"$l\""; if ( $d eq "pilots") {push @p,$tmp;} else {push @u,$tmp;} } print "{\"pilots\":{".join(",\n",@p)."},\"upgrades\":{".join(",\n",@u)."}}\n"' > cards.json

