#!/bin/bash
mkdir -p build
docker run --rm -v "`pwd`:/devdir" -v "`pwd`/build:/builddir" -w /devdir node:6.1 bootstrap/config.sh
