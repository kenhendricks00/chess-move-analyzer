#!/usr/bin/env bash

set -e

# Define build destination
DES=dist/build/chess-move-analyzer.firefox
rm -rf $DES
mkdir -p $DES

# Copy files specific to Firefox extension
cp -R platform/firefox/* $DES/

# Create a versioned XPI package
pushd dist/build
zip -r chess-move-analyzer_"$1".firefox.xpi chess-move-analyzer.firefox
popd