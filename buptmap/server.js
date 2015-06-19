// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');

// MongoDB
mongoose.connect('mongodb://localhost/buptmap1');

// Express
var app = express();
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/api', require('./routes/api'));

// Start server
app.listen(3001);
console.log('API is running on port 3001');

var send404Response = function (response) {
    response.writeHead(404, {"Content-Type":"text/plain"});
    response.write("Error 404: Page not Found");
    response.end();
};

var onRequest = function(request, response) {
    if (request.method == 'GET' && request.url == '/') {
        response.writeHead(200, {"Content-Type":"text/html"});
        fs.createReadStream("./frontend/map.html").pipe(response);

    } else {
        send404Response(response);
    }
};

http.createServer(onRequest).listen(3002);

console.log("Server is now running on " + 3002);
