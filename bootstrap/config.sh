#!/bin/bash
PWD_DIR=`pwd`
BUILD_DIR=build

cd $BUILD_DIR
BUILD_DIR=`pwd`
cd $PWD_DIR

cp -R $PWD_DIR/bootstrap $BUILD_DIR  
BOOTSTRAP_DIR=$BUILD_DIR/bootstrap
mkdir -p $BOOTSTRAP_DIR

cd $BOOTSTRAP_DIR

npm install > /dev/null 2>&1
mkdir -p "$BUILD_DIR/src"
node replaceConfigInFiles "$PWD_DIR/config" "$PWD_DIR/src" "$BUILD_DIR/src"
cd $PWD_DIR
