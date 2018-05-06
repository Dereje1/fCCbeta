// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/timestamp/:dateVal", function (req, res) {
  let parsedDateUnix,returnObject
  //if user param is already a number just use number otherwise parse with builtin function
  parsedDateUnix = Number(req.params.dateVal) ? Number(req.params.dateVal) : Date.parse(req.params.dateVal)
  let naturalDate = new Date(parsedDateUnix)
  if(parsedDateUnix && naturalDate!="Invalid Date") {//if valid unix date & valid parsed date
    returnObject = {"unix":parsedDateUnix.toString(),"utc":naturalDate.toUTCString()}
  }
  else{
    returnObject = {"unix":null,"utc":"Invalid Date"}
  }
  res.send(returnObject)
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});