var express = require("express");
var app = express();

var port = 3000;

app.get("/", function(req, res) {
	res.sendFile("map.html");
});

app.listen(port);
console.log("port 3000");