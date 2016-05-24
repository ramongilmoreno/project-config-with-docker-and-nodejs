var StreamSearch = require('streamsearch');
var fs = require("fs");
var vm = require('vm');

var config = require("./config.js");

// Merge config
// http://www.scriptol.com/javascript/include.php
// but will be used with eval to run as if run locally
var mergeConfigDir = process.argv[2];
var mergeConfig = fs.readdirSync(mergeConfigDir);
mergeConfig.sort();
for (var i in mergeConfig) {
	var f = mergeConfigDir + "/" + mergeConfig[i];
	if (f.match(/.*\.js$/) && fs.statSync(f).isFile()) {
		var contents = fs.readFileSync(f).toString();
		eval(contents);
	}
}

// Find files in src folder
var files = [];
var startDir = process.argv[3];
var buildDir = process.argv[4];

function recurseDir (dir) {
	var contents = fs.readdirSync(startDir + dir);
	for (var i in contents) { 
		var n = dir + contents[i];
		var f = startDir + n;
		var stats = fs.statSync(f); 
		if (stats.isFile()) {
			files.push(n);
		} else if (stats.isDirectory()) {
			// http://stackoverflow.com/a/35016418
			var targetDir = buildDir + n;
			try {
				if (!fs.statSync(targetDir).isDirectory()) {
					var err = "Target is not a directory: " + targetDir;
					console.error(err);
					throw err;
				}
			} catch (e) {
				if (e.code == 'ENOENT') { // no such file or directory. File really does not exist
					fs.mkdirSync(targetDir);
				} else {
					console.error("Exception fs.statSync (" + targetDir + "): " + e);
					throw e; // something else went wrong, we don't have rights, ...
				}
			}
			recurseDir(n + "/");
		}
	}	
}
recurseDir("/");

// Produce files
function produceSingleFile (index) {
	if (index == files.length) {
		process.exit();
	}
	console.log("Producing file src" + files[index]);
	
	var inCode = undefined;
	var input = fs.createReadStream(startDir + files[index]);
	var output = fs.createWriteStream(buildDir + files[index]);
	
	// https://github.com/mscdex/streamsearch
	s = new StreamSearch(new Buffer("==CONFIG=="));
	s.on('info', function(isMatch, data, start, end) {
		// console.log("INFO", isMatch, data, start, end);
		if (data) {
			if (inCode != undefined) {
				inCode = inCode + data.toString("utf8", start, end);
			} else {
				output.write(data.slice(start, end));
			}
		}
		if (isMatch) {
			if (inCode) {
				var value = eval(inCode);
				// http://stackoverflow.com/a/6286551
				if (!(typeof value === 'string')) {
					// Convert to string and keep undefined string too
					value = "" + value;
				}
				output.write(value);
				inCode = undefined;
			} else {
				inCode = "";
			}
		}
	});
	input.on('data', (chunk) => {
		s.push(chunk);
	});
	input.on('end', function () {
		output.end();
		
	});
	output.on('finish', function () {
                // Apply original file flags
		fs.chmodSync(buildDir + files[index], fs.statSync(startDir + files[index]).mode);
		produceSingleFile(++index);
	});
};
produceSingleFile(0);

