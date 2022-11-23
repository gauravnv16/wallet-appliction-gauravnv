const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express()
var path = require('path');
var bodyParser = require('body-parser');  
var uname="";
var login_status = false;
var user_status={};
var urlencodedParser = bodyParser.urlencoded({ extended: false })  
const {v4 : uuidv4} = require('uuid')



var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "users",
  insecureAuth : true
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!!")
  
});



app.use('/styles',express.static(path.join(__dirname, 'styles'))); 
app.use('/images',express.static(path.join(__dirname, 'images'))); 
app.use('/js',express.static(path.join(__dirname, 'js'))); 


app.use(expressLayouts)
app.set('view engine', 'ejs');


// home routes
app.get('/', (req, res) => {
  res.render('HomeRoutes/index',{login_status:login_status})
});


app.get('/about', (req, res) => {
    res.render('HomeRoutes/about',{login_status:login_status})
  });
app.get('/contact', (req, res) => {
    res.render('HomeRoutes/contact',{login_status:login_status})
  });

app.get('/login', (req, res) => {
  if(login_status==true)
  res.redirect('/Dashboard');
  else
    res.render('HomeRoutes/login',{login_status:login_status})
  });

app.get('/Dashboard', (req, res) => {
    res.render('ProfileRoutes/profile',{uname:user_status.name,balance:user_status.balance,login_status:login_status})
    
});

app.get('/logout', (req, res) => {
  login_status = false;
  res.redirect('/');
});

app.get('/Dashboard/addbalance', (req, res) => {
  res.render('ProfileRoutes/Addbalence',{login_status:login_status})
});

app.post('/Dashboard/addbalance',urlencodedParser,(req, res) => {
  var money = req.body.addmoney;
  con.query(`update persons set balance=${Number(money)+Number(user_status.balance)} where userName='${user_status.name}'`, function (err, result, fields) {
    if (err) throw err;
    console.log('updated!!');
    user_status.balance = Number(money)+Number(user_status.balance);
    res.redirect('/Dashboard');
  });
  
});

app.get('/Dashboard/history', (req, res) => {
  res.render('ProfileRoutes/history',{login_status:login_status})
});

app.get('/Dashboard/pay', (req, res) => {
  res.render('ProfileRoutes/pay',{login_status:login_status})
});

app.get('/confirmation', (req, res) => {
  login_status = false;
  res.redirect('/');
});

app.get('/register', (req, res) => {
  if(login_status==true){
    res.redirect('/Dashboard');
  }
  else
    res.render('HomeRoutes/register',{login_status:login_status})
});
 
app.post('/register',urlencodedParser, (req, res) => {
  var uid = uuidv4();
  var uname = req.body.username;
  var email = req.body.email;
  var pass1 = req.body.password1;
  var pass2 = req.body.password2;
  var balance = 0;
  if(login_status!=true){
    if(pass1==pass2){
      
      con.query(`insert into Persons values('${uname}','${email}','${pass1}',${balance},'${uid}')`, function (err, result, fields) {
        if (err) throw err;
        user_status = {
          name: uname,
          balance: balance,
          log_status:"logged_In"
        }
        login_status=true;
        console.log('inserted!!');
      });
    
    res.redirect('/Dashboard');
    
    }

  }
  
  
});


app.post('/login', urlencodedParser,(req, res) => {
  if(!login_status){
    uname = req.body.username;
    var password = req.body.password;
    var db ;

    con.query(`select * from persons where userName = '${uname}';`, function (err, result, fields) {
      if (err) throw err;
      if(uname == result[0].userName && password == result[0].pass){
        user_status = {
          name: uname,
          balance: result[0].balance,
          log_status:"logged_In"
        }
        console.log(user_status.balance);
        login_status = true;
        res.redirect('/Dashboard');

        }
        else{
          res.render('<h1>error</h1>')
        }
    });
  }
  else{
    res.redirect('/Dashboard');
  }
    // sessionStorage.setItem("user_status",JSON.stringify(user_status));
})

app.listen(3000);
// console.log();