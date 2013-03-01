// @author: David M. Roehrscheid
// Twitter: @daviddavid
global.DEBUG = true;
global.debug = function(message){
  if ( global.DEBUG ) {
    console.log(message);
  }
}
global.error = function(message){
  console.log(message);
}
global.die = function(error){
  global.error("I'm dieing: " + error);
  process.exit(1);
}

var  inspect = require("util").inspect,
     colors = require("colors"),
     http = require("http"),	

     lookup = require("./lib/norikae-jorudan.js"),
     mailbox = require("./lib/norikae-mailbox.js"),
     mailparser = require("./lib/norikae-parsemail.js"),

     userdata = require("./account.json"),
     mailconf = {
      user: userdata.user,
      password: userdata.password,
      host: "imap.gmail.com",
      port: 993,
      secure: true
     },

     mailcount = 0
     requestcount = 0;

if ( process.env.norikaeusername && process.env.norikaepassword ) { 
  debug("server: ".red + "Setting user and password from environment variables.");
  mailconf.user = process.env.norikaeusername;
  mailconf.password = process.env.norikaepassword;
}

// Add different commands here
function evaluate(result){
  if ( result.command === "norikae" ){
  	debug("server: ".red + "Got a 'norikae' request: " + result.from + " --> " + result.to);
  }
}

// Mailbox
mailbox.connect(mailconf);

mailbox.on("mailreadytoparse", function(mail){ 
  debug("server: ".red + "Parsing new mail.");
  mailcount++;
  mailparser.parsemail(mail, function(result){
  	if ( result.success ){
  		requestcount++;
  		evaluate(result);
  	}
  });
});

/* ***** */
// Http Server
var port = process.env.PORT || 8080;
var app = http.createServer(httphandler);
app.listen(port);
debug("server: ".red + "listening to http on port " + port);

function httphandler(req, res){
  res.writeHead(200);
  res.end("Parsed " + mailcount + " mails since start - " + requestcount + " requests.");
}
