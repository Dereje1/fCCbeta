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

app.get("/api/whoami", function (req, res) {
     let headerObject = req.headers
     //the x-forwarded-for property of the header does not appear for local host so add an alternative or will
     //error out locally on split to get the ip address the rest of the requests are common to loacl and remote
     let ip = (headerObject['x-forwarded-for']||req.socket.remoteAddress).split(",")[0];
     let language = headerObject['accept-language'].split(",")[0];
     let software = headerObject['user-agent'].split('(')[1].split(')')[0]
     //console.log([ip,language,software])
     let result = {"ipaddress":ip,"language":language,"software":software}
     res.end(JSON.stringify(result))
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
