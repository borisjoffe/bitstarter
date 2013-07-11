#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var TEMP_HTMLFILE = "tempindex.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://lit-brook-5967.herokuapp.com/";
var DBG = true;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var checkAndOutputJson = function(htmlfile, checksfile) {
	console.log("at end: htmlfile - " + htmlfile + "\nchecksfile = " + checksfile);
	var checkJson = checkHtmlFile(htmlfile, checksfile);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        //.option('-u, --url <website_url>', 'URL input', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <website_url>', 'URL input', URL_DEFAULT)
        .parse(process.argv);
	if (DBG) console.log("checks: " + program.checks + "\nfile: " + program.file + "\nurl: " + program.url + "\n" 
		+ "process.argv: " + process.argv);

	usingFile = false;
	usingURL = false;

	process.argv.forEach(function(val, index, array) {
		if (val.indexOf("--url") != -1 || val.indexOf("-u") != -1)
			usingURL = true;
		if (val.indexOf("--file") != -1 || val.indexOf("-f") != -1)
			usingFile = true;
	});

	if (usingURL && !usingFile) {
		console.log("using URL");
		rest = require("restler");
		rest.get(program.url).on('complete', function (data) {
			console.log("Getting tempindex.html from URL");
			fs.writeFileSync(TEMP_HTMLFILE, data);
			checkAndOutputJson(TEMP_HTMLFILE, program.checks);
		});
	} else {
		console.log("going back to default file processing");
		checkAndOutputJson(program.file, program.checks);
	}

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
