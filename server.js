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
        expires: 600000
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
app.set('port', 3883);
/*Table names*/
var admin_table = "Admins";
var user_table = "Users";
var contact_table = "Contacts";
var bets_table = "Bets";
var placed_table = "PlacedBets";
var team_table = "Team";

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

        res.redirect('/UserSignIn');
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
     if(err){

       error = err;
       console.log(error);
     }

if (result == undefined || result.length != 1){
error = {error: "number of rows was not 1 " + result.length }

}else{

req.session.user = { "username": result[0].username, "type":"admin" };
console.log(req.session.user);
req.session.save();
}
  });
console.log("error before check", error);
  if(Object.keys(error).length == 0){

    req.flash('success', 'Logged In')
        res.redirect('/AdminHome');
        //res.render('AdminHome', context);
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
     if(err){
       error = err;
       console.log(error);

     }

if (result == undefined || result.length != 1){
error = {error: "number of rows was not 1" }

}else{

req.session.user = { "username": result[0].username, "type":"user" };
req.session.save();
console.log(req.session.user);
}
  });
  console.log(error);
  if(Object.keys(error).length == 0){

    req.flash('success', 'Logged In')
        res.redirect('/UserHome');
  }else{

    req.flash('danger', 'No user with that password was found')
       res.render('usersignin', context);
  }
});
app.get('/AdminSignIn', function(req, res){
res.render('adminsignin');
});
app.get('/UserSignIn', function(req, res){
    if (req.session.user) {
        console.log(req.session.user);
    }
res.render('usersignin');
});

app.get('/', function(req, res){
res.redirect('/UserSignIn');

});


app.get('/UserHome',function(req,res){


    if (!req.session.user) {
      console.log("No username defined in this session");
      console.log(req.session);
      res.redirect('/UserSignIn');
      res.end();
    }
    pool.query("SELECT Bets.betid, tm.teamname as team1, tm1.teamname as team2, team1odds, team2odds, team1payout, team2payout FROM "+
     bets_table +
     " INNER JOIN Team as tm ON tm.teamid = Bets.team1id inner join Team as tm1 ON tm1.teamid = Bets.team2id inner join "
      + placed_table + " as pt ON pt.betid = Bets.betid where pt.username = ?", [req.session.user.username], function(err, result){
      if(err){
        console.log(err);
        console.log({result:result});
          res.redirect('/UserSignIn');
      }else{
        console.log(result.length);
        console.log({result:result})
      res.render('UserHome', {result:result});
      }
    });



});




app.get('/home', function(req,res){


  console.log(req.session.user);
    pool.query("SELECT betid, tm.teamname as team1, tm1.teamname as team2, team1odds, team2odds, team1payout, team2payout FROM "+ bets_table + " INNER JOIN Team as tm ON tm.teamid = Bets.team1id inner join Team as tm1 ON tm1.teamid = Bets.team2id", function(err, result){
      if(err){
        console.log(err);
        console.log({result:result});
          res.redirect('/UserSignIn');
      }else{
        console.log(result.length);
        console.log({result:result})
      res.render('home', {result:result});
      }
    });



});
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/UserSignIn');
    }
});


app.post('/PlaceBet', function(req, res){
  var error = {};
  var context = {};
  context.betid = req.body.betid;
  context.username = req.body.username;
  context.betamount = req.body.betamount;
  if (req.session.user && req.cookies.user_sid) {
  pool.query("INSERT INTO "+ placed_table + " (betid, username, betamount) VALUES (?, ?, ?)",
   [req.body.betid, req.session.user.username, req.body.betamount], function(err, result){
    if(err){
      error = err;
      console.log(error);
    }

  });
  if(Object.keys(error).length){

    req.flash('success', 'An error occured, please try again.')
       res.redirect('/home');
  }else{


        res.redirect('/home');
  }}else{res.redirect('/UserSignIn');}


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
  if(Object.keys(error).length == 0){

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


  app.get('/AdminHome',function(req,res){

  pool.query("SELECT * FROM "+ admin_table + " WHERE isApproved = 0 ", function(err, result){
    if(err){
      console.log(err);
        res.redirect('/home');
    }else{
      console.log(result.length);
      console.log(result);
    res.render('AdminHome', {result:result});
    }
  });
  });

app.get('/approveSingleAdmin/:username',function(req,res){
console.log(req.params.username);
  pool.query("UPDATE "+ admin_table + " SET isApproved = 1 WHERE USERNAME = ? ", [req.params.username], function(err, result){
    if(err){
      console.log(result);
      console.log(err);
        res.redirect('/AdminHome');
    }else{
            console.log(result);
      console.log(result.length);
  res.redirect('/AdminHome');
    }
  });
});

  app.get('/deleteAdminRequest/:username',function(req,res){
  console.log(req.params.username);
    pool.query("DELETE FROM "+ admin_table + " WHERE USERNAME = ? ", [req.params.username], function(err, result){
      if(err){
        console.log(result);
        console.log(err);
          res.redirect('/AdminHome');
      }else{
              console.log(result);
        console.log(result.length);

      }
    });



 res.redirect('/AdminHome');
});


app.post('/saveBetDraft', function(req, res){

});
app.post('/CreateBet',function(req,res){

  var error =  {};
  var context = {};
  context.team1 = req.body.Team1;
  context.team2 = req.body.Team2;
  context.payout1 = req.body.Payout1;
  context.payout2 = req.body.Payout2;
  context.odds1 = req.body.Odds1;
  context.odds2 = req.body.Odds2;
  console.log(req.body);
  pool.query("INSERT INTO "+ team_table + " (teamName) SELECT * FROM (SELECT ?) as tmp  WHERE NOT EXISTS (SELECT teamName FROM " + team_table + " WHERE teamName = ? ) LIMIT 1",
   [req.body.Team1, req.body.Team1], function(err, result){
    if(err){
      error = err;
      console.log(error);

    }
console.log(result);
  });

  pool.query("INSERT INTO "+ team_table + " (teamName) SELECT * FROM (SELECT ?) as tmp  WHERE NOT EXISTS (SELECT teamName FROM " + team_table + " WHERE teamName = ? ) LIMIT 1",
   [req.body.Team2, req.body.Team2], function(err, result){
    if(err){
      error = err;
      console.log(error);

    }
console.log(result);
  });

  pool.query("SELECT * FROM Bets",
    function(err, result, fields){
    if(err){
      error = err;

    }
    console.log(result);
  });

  pool.query("INSERT INTO "+ bets_table + " (team1id, team2id, team1odds, team2odds, team1payout, team2payout) VALUES ((SELECT teamid FROM Team WHERE teamName = ?), (SELECT teamid FROM Team WHERE teamName = ?), ?, ?, ?, ?)",
   [req.body.Team1, req.body.Team2, req.body.Odds1, req.body.Odds2, req.body.Payout1, req.body.Payout2], function(err, result){
       console.log(pool.query.sql);
    if(err){
      error = err;
      console.log(error);
    }

  });
  if(Object.keys(error).length){


        res.redirect('/AdminHome');
  }else{

    req.flash('success', 'Thank you ' + context.inputName + '! Please Sign in. ')
          res.redirect('/AdminHome');
  }
});


app.get('/About',function(req,res){
 res.render('about');
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
