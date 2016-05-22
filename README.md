# Configure project properties with JavaScript

## Introduction

This skeleton project shows how to define a project properties
with JavaScript code.

This allows not only JSON but any JavaScript code.

The initial (default) config is obtained from the file

    bootstrap/config.js
    
And changes are read from the top level `*.js` files in the
`config/` directory. In the sample files included, the configuration
is changed by these scripts:

    config/changes-0.js
    config/changes-1.js

The resulting config is then used to update the source files at:

    src/
    
All files from that directory will be parsed and occurrences of
the `==CONFIG== <some JavaScript code to access configuration> ==CONFIG==`
will be replaced with the result of the execution of the code.

The updated source files will be put in the build directory:

    build/src/
    
## System requirements

This script has been tested in *Linux* as it uses *Docker* containers to
run the `node:6.1` image to evaluate JavaScript config files and the
configuration substitution script.
