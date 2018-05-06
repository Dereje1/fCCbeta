'use strict';

var express = require('express');
var cors = require('cors');

let multer = require('multer')
let upload = multer()
// require and use "multer"...

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
  });

app.get('/hello', function(req, res){
  res.json({greetings: "Hello, API"});
});

//note .post for forms, also the upload.single filename must match the input type name and the the fileupload route must match the form "action" attribute
app.post('/api/fileanalyse', upload.single('upfile'),function (req, res) {
 //in case no file uploaded and submit button clicked send null otherwise...
 return (!req.file) ? res.end(JSON.stringify({name:null,size:null})) : res.end(JSON.stringify({name:req.file.originalname,size:req.file.size}))
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});
