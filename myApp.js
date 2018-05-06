
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// --> 7)  Mount the Logger middleware here


// --> 11)  Mount the body-parser middleware  here
app.use(bodyParser.urlencoded({extended : false}))
app.use('/',(req,res,next)=>{
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
})
/** 1) Meet the node console. */
console.log("Hello World")

/** 2) A first working Express Server */
app.get('/',(req,res)=>{
  let absolutePath = __dirname + "/views/index.html"
  res.sendFile(absolutePath)
})

/** 3) Serve an HTML file */


/** 4) Serve static assets  */
app.use(express.static(__dirname+"/public"))


/** 5) serve JSON on a specific route */
app.get('/json',(req,res)=>{
  let message = "Hello json"
  let resp = (process.env.MESSAGE_STYLE==="uppercase") ?  message.toUpperCase() : message
  res.json({"message": resp})
})

/** 6) Use the .env file to configure the app */
 
 
/** 7) Root-level Middleware - A logger */
//  place it before all the routes !


/** 8) Chaining middleware. A Time server */
app.get('/now',timeMiddleware,(req,res)=>{
  res.json({time:req.time})
})

function timeMiddleware(req,res,next){
  req.time = (new Date().toString())
  next()
}

/** 9)  Get input from client - Route parameters */
app.get('/:word/echo',(req,res)=>{
  res.json({echo: req.params.word})
})

/** 10) Get input from client - Query parameters */
// /name?first=<firstname>&last=<lastname>
app.get('/name',(req,res)=>{
  res.json({name : req.query.first +" " +req.query.last})

})
  
/** 11) Get ready for POST Requests - the `body-parser` */
// place it before all the routes !


/** 12) Get data form POST  */
app.post('/name',(req,res)=>{
  res.json({name : req.body.first +" " +req.body.last})
})


// This would be part of the basic setup of an Express app
// but to allow FCC to run tests, the server is already active
/** app.listen(process.env.PORT || 3000 ); */

//---------- DO NOT EDIT BELOW THIS LINE --------------------

 module.exports = app;
