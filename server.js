'use strict';

var express = require('express');
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var cors = require('cors');
const bodyParser = require('body-parser');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

//use mongodb
//set database link to environemnt to protect from public access
let dbLink =process.env.MONGOLAB_URI

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

createDBNew(dbLink).then(function(dbStatus){//Initializes a new collection if it doesn't already exist
  console.log(dbStatus)
})

app.get("/:shorturlVal", function (req, res) {//for redirecting a succesfully shortened url
  let shortURLID = req.params.shorturlVal
  let lookForURL = findURL(dbLink,shortURLID,false)//search database for url id , bylink=false means search by id
  lookForURL.then(function(found){//lookForURL returns a promise so must wait with then
    if(found.length===0){//if not found return error
      res.end(JSON.stringify({"error" : shortURLID + " Is not in the database"}))
    }
    else{//if found redirect
      res.redirect(found[0]['originalURL'])
      res.end()
    }
  })
});


app.post('/api/shorturl/new', function(req,res){///process url shortening request, notice *
  //let originalURL = req.params.linkVal+req.params['0'] // use params which will get everyhting but queries
  let originalURL = req.body.url
  if (Object.keys(req.query).length!==0){//if there is a query add it into the link
    originalURL= originalURL + "?" + Object.keys(req.query)[0] + "=" + req.query[Object.keys(req.query)[0]]
  }
  let urlValidity = /^(ftp|http|https):\/\/[^ "]+$/.test(originalURL);//use rexgex to verify url protocol
  if(!urlValidity){
    res.end(JSON.stringify({"error" : originalURL + ", Is an Invalid URL format, Try again!"}))
    return;//make sure leaves get otherwise will enter invalid url into database
  }
  //need this to append to new shortened id to make a link, the first one is good for refering (submit) the second one works for calls from within the main page
  let hostURL = (req.headers.referer||(req.protocol+"://"+req.headers.host+ "/"))
  //first look if requested url is already in databse
  let lookForURL = findURL(dbLink,originalURL)//bylink=true, look for url
  lookForURL.then(function(urldocs){//lookForURL returns a promise so must wait with then
    if(urldocs.length===0){//url was not found prepare to insert new url
      let shortURLID = makeid()//make a random text to serve as id
      insertURL(dbLink,originalURL,shortURLID).then(function(report){//call insert url function and report results with promise
        let jsonConstruct={
          "Original URL" : originalURL,
          "New ID" : shortURLID,
          "New Link": hostURL + shortURLID,
          "Time Stamp": (Date.now().toString())
        }
        res.end(JSON.stringify(jsonConstruct))

      })
    }
    else{//url already exists in database no need to insert just report
      let jsonConstruct={
        "Original URL" : urldocs[0]["originalURL"],
        "ID" : urldocs[0]["shortenedURL"],
        "Link": hostURL + urldocs[0]["shortenedURL"],
        "Time Stamp": (urldocs[0]["timeStamp"]).toString()
      }
      res.end(JSON.stringify(jsonConstruct))
    }
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});

//all custom defined functions below, may try to include into an import in the future
function makeid() {//makes a random shortened ID
  let randomText = "";
  //make alphanumeric
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++){
    randomText += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomText;
}

function createDBNew(dbLink){//creates a new collection if it doesn't exist
 // note this function is not really necesseray for app to function  but created while I was experimenting with
 //mongodb, collections can be created on the fly with new document insertions
  let coll//if  not declared here will not be recognized down stream of the promises
  return mongo.connect(dbLink)//will return connection status via chain of promises
    .then(function(db){
      coll = db.collection('URLColl')//if no collection will automatically create, if there is will refer to
      return coll.count()//function counts total documents in collection
    })
    .then(function(docCount){
      if(docCount===0){//initialize collection with a new fake record
        let insertedObject = {
          originalURL: "Database Initialization",
          shortenedURL: "Database Initialization",
          timeStamp: Date.now()
        }
        console.log("Initializing collection with " + JSON.stringify(insertedObject))
        coll.insert(insertedObject)
        return "Collection Initialized"
      }
      else{//if documents found do nothing
        return "Collection already exists"
      }
    })
    .catch(function(err) {
        console.log("Error in Database/Collection Creation Module!!")
        throw err;
    });
}

function findURL(dbLink,userQuery, bylink=true){// finds a requested URL, if bylink is true it will search
  //by link, otherwise will search by urlid
  let query = bylink ? {originalURL: userQuery} : {shortenedURL: userQuery}
  return mongo.connect(dbLink)//returns promise after finding
    .then(function(db){
      let collection = db.collection('URLColl')//specify collection
      return collection.find(query).toArray()//look for query and use built in array function
    })
    .then(function(items) {//the whole function will return this
      return items
    })
    .catch(function(err) {
        throw err;
    });
}
function insertURL(dbLink,original,idURL){//inserts URL and new id into database
  return mongo.connect(dbLink)//returns promise after inserting
    .then(function(db){
      let collection = db.collection('URLColl')//specify collection
      let insertedObject = {
        originalURL: original,
        shortenedURL: idURL,
        timeStamp: Date.now()
      }
      return collection.insert(insertedObject)
    })
    .then(function(newInsertion){//insert then log(for debugginh)
      console.log(original + " succesfully entered into DB")
    })
    .catch(function(err) {
        throw err;
    });
}