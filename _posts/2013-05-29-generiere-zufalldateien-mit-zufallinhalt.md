---
layout: post
tag: general
title: Generiere Zufalldateien mit Zufallinhalt
subtitle: "Ein Shellscript, mit dem man Dateien in zufaelliger Anzahl, Groesse und Namen erstellen kann."
date: 2013-05-29
author: eumel8
---

Ein Shellscript, mit dem man Dateien in zufaelliger Anzahl, Groesse und Namen erstellen kann. 

<br/>

```bash
#!/bin/bash
#generate random files

if [ ! $# -gt 0 ]; then
echo "usage: $0 <numfiles> [<blocksize> <maxblocks>]"
echo " <numfiles>: number of files to create,"
echo " <blocksize>: size of file blocks (default 1024 bytes)"
echo " <maxblocks>: maximum number of blocks per file (default 100)"
echo ""
echo "Parameters after the third provided number are ignored."
echo ""
exit
fi

NUMFILES=$1
if test "$2" == ""; then
BLOCKSIZE=1024
else
BLOCKSIZE=$2
fi
echo Using blocksize $BLOCKSIZE

if test "$3" == ""; then
MAXBLOCKS=100
else
MAXBLOCKS=$3
fi
echo Using max blocks $MAXBLOCKS

for I in $(seq 1 $NUMFILES)
do
echo $((($RANDOM % $MAXBLOCKS) +1))
dd if=/dev/urandom of=testfile.$I.$RANDOM.bin bs=$BLOCKSIZE count=0 seek=$((($RANDOM % $MAXBLOCKS) + 1))
done

```
