//var express = require('express');
var fs = require('fs');
var http = require('http');
var nodestatic = require('node-static');
var file = new(nodestatic.Server)();

var port = process.env.PORT || 5000;

http.createServer(function(req, res) {
	file.serve(req, res);
}).listen(port);

console.log("Listening on " + port);

/*
var app = express(express.logger());

app.get('/', function(request, response) {
	var buf = Buffer(fs.readFileSync('index.html'), 'utf-8');

  response.send(buf.toString('utf-8'))
  //response.send('Hello World 2!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});*/
