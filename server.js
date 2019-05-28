var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
//var flash = require('express-flash');
//var cookieParser = require('cookie-parser');
var session = require('express-session');
//var validator = require('express-validator');

  var path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(session({secret:'SuperSecretPassword'}));
//  app.use(flash());


// prepare server
 // redirect API calls
 app.use('/', express.static(__dirname + '/www')); // redirect root
 app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
 app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
 app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.engine('handlebars', handlebars.engine);
app.use(express.static('Pictures'));
app.use(express.static('CSS'));
app.set('view engine', 'handlebars');
app.set('port', 3881);





app.get('/',function(req,res){
 res.render('home');
});

app.get('/ContactUs',function(req,res){
 res.render('contactus');
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
