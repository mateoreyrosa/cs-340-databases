var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
//var validator = require('express-validator');
var morgan = require('morgan');
  var path = require('path');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600
    }
}));
  var mysql = require('mysql');
  var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_yorkar',
    password        : '7281',
    database        : 'cs340_yorkar',
    "dateStrings": true
  });
// prepare server
 // redirect API calls
 app.use('/', express.static(__dirname + '/www')); // redirect root
 app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
 app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
 app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.engine('handlebars', handlebars.engine);
app.use(express.static('Pictures'));
app.use(express.static('CSS'));
app.use(cookieParser());
app.set('view engine', 'handlebars');
app.set('port', 3881);
/*Table names*/
var admin_table = "Admins";
var user_table = "Users";
var admin_request = "shrimp";
var contact_table = "Contacts";
var bets_table = "Bets";
var playsin_table = "PlaysIn";
var games_table = "Games";

app.use(flash());
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/home');
    } else {
        next();
    }
};
/*Sign up and Sign in methods*/
app.post('/AdminSignUp', function(req, res){
  var error =  {};
  var context = {};
  context.ContactName = req.body.ContactName;
  context.ContactEmail = req.body.ContactEmail;
  context.Username = req.body.Username;
  context.Password = req.body.Password;
  pool.query("INSERT INTO "+ admin_table + " (name, email, username, password, isApproved) VALUES (?, ?, ?, ?, 0)",
   [req.body.ContactName, req.body.ContactEmail, req.body.Username, req.body.Password], function(err, result){
    if(err){
      error = err;
      console.log(error);
    }

  });
  if(Object.keys(error).length){

    req.flash('danger', 'Your sign up request failed. Please try again.')
       res.render('adminsignup', context);
  }else{

    req.flash('success', 'Thank you ' + context.ContactName + '! You will be notified when your request is approved')
        res.render('adminsignin', context);
  }
});

app.get('/AdminSignUp', function(req, res){
res.render('adminsignup');
});

app.post('/AdminSignIn', function(req, res){
  var error =  {};
  var context = {};

  context.Username = req.body.Username;
  context.Password = req.body.Password;
  console.log("username: ", context.Username);
  console.log("password: ", context.Password);
  pool.query("SELECT * FROM "+ admin_table + " WHERE username = ? AND password = ?",
   [req.body.Username, req.body.Password], function(err, result){
error = err;
console.log(error);
if (result == undefined || result.length != 1){
error = {error: "number of rows was not 1 " + result.length }

}else{

req.session.user = { "username": result[0].username, "type":"admin" };
}
  });
console.log("error before check", error);
  if(Object.keys(error).length == 0){

    req.flash('success', 'Logged In')
        res.render('home', context);
  }else{

    req.flash('danger', 'No user with that password was found')
       res.render('adminsignin', context);
  }
});
app.get('/AdminSignIn', function(req, res){
res.render('adminsignin');
});



app.post('/UserSignUp', function(req, res){
  var error =  {};
  var context = {};
  context.inputName = req.body.inputName;
  context.inputEmail = req.body.inputEmail;
  context.inputUsername = req.body.inputUsername;
  context.inputPassword = req.body.inputPassword;
  pool.query("INSERT INTO "+ user_table + " (name, email, username, password) VALUES (?, ?, ?, ?)",
   [req.body.inputName, req.body.inputEmail, req.body.inputUsername, req.body.inputPassword], function(err, result){
    if(err){
      error = err;
      console.log(error);
    }

  });
  if(Object.keys(error).length){

    req.flash('danger', 'Your sign up failed. Please try again.')
       res.render('usersignup', context);
  }else{

    req.flash('success', 'Thank you ' + context.inputName + '! Please Sign in. ')
        res.render('usersignin', context);
  }
});
app.get('/UserSignUp', function(req, res){
res.render('usersignup');
});



app.post('/UserSignIn', function(req, res){
  var error =  {};
  var context = {};

  context.Username = req.body.inputUsername;
  context.Password = req.body.inputPassword;
  pool.query("SELECT * FROM "+ user_table + " WHERE username = ? AND password = ?" ,
   [req.body.inputUsername, req.body.inputPassword], function(err, result){
error = err;
console.log(error);
if (result == undefined || result.length != 1){
error = {error: "number of rows was not 1" }

}else{

req.session.user = { "username": result[0].username, "type":"user" };
}
  });
  console.log(error);
  if(Object.keys(error).length == 0){

    req.flash('success', 'Logged In')
        res.render('home', context);
  }else{

    req.flash('danger', 'No user with that password was found')
       res.render('usersignin', context);
  }
});
app.get('/AdminSignIn', function(req, res){
res.render('adminsignin');
});
app.get('/UserSignIn', function(req, res){
res.render('usersignin');
});

app.get('/', function(req, res){
res.redirect('/UserSignIn');

});
app.get('/home',function(req,res){
  if (req.session.user && req.cookies.user_sid) {
         res.render('home');
    } else {
    res.redirect('/UserSignIn');
    }

});
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/UserSignIn');
    }
});

app.post('/ContactUs', function(req, res){
  var error = {};
  var context = {};
  context.ContactName = req.body.ContactName;
  context.ContactEmail = req.body.ContactEmail;
  context.Message = req.body.Message;
  pool.query("INSERT INTO "+ contact_table + " (name, email, message) VALUES (?, ?, ?)",
   [req.body.ContactName, req.body.ContactEmail, req.body.Message], function(err, result){
    if(err){
      error = err;
      console.log(error);
    }

  });
  if(error != {}){

    req.flash('success', 'An error occured, please try again.')
       res.render('contactus', context);
  }else{

    req.flash('success', 'Thank you ' + context.ContactName + '! We will be in touch.')
        res.render('contactus', context);
  }


});

app.get('/ContactUs',function(req,res){
 res.render('contactus');
});


app.post('/approveSingleAdmin',function(req,res){
 res.render('pendingAdminRequests');
});
app.get('/PendingAdminRequests',function(req,res){
 res.render('pendingAdminRequests');
});

app.post('/saveBetDraft', function(req, res){

});
app.post('/CreateBet',function(req,res){
 res.render('createBet');
});
app.get('/CreateBet',function(req,res){
 res.render('createBet');
});

app.get('/About',function(req,res){
 res.render('about');
});

app.get('/Store',function(req,res){

 res.render('store');
});
//downlaod
app.get('/CustomOrderInstructions', function(req, res){

  var file = 'CustomOrderInstructions.txt';
   res.download(file);


});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
