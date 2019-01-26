"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var jwt = require('jwt-simple');

const SECRET = 'mysecret';

var users = [{"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire", "password": "secretpass"}];
var reviews = [["doctorwhocomposer", "My husband and I love this place, could not reccommend it enough!"]]

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('cache-control', 'private, max-age=0, no-cache, no-store, must-revalidate');
  res.setHeader('expires', '0');
  res.setHeader('pragma', 'no-cache');
  next();
});

app.use(express.static('public'));

passport.use(new LocalStrategy((username, password, done) => {
  var i;
  console.log("authenticating");
  for (i = 0; i < users.length; ++i){
    if (users[i]["username"] == username && users[i]["password"] == password){
      done(null, jwt.encode({ username }, SECRET));
      return;
    }
  }
  done(null, false);
}));

passport.use(new BearerStrategy((token, done) => {

  try {
    const { username } = jwt.decode(token, SECRET);

    var i;
    for (i = 0; i < users.length; ++i){
      if (username === users[i]["username"]){
        console.log("valid username found");
        done(null, username);
        return;
      }
    }
    done(null, false);
  } catch (error) {
    done(null, false);
  }
}));

app.post(
  '/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    res.send({
      token: req.user,
    });

  },
);

app.post('/people', function(req, resp){

  if(req.headers["access_token"] === "concertina"){

    var usernameRequested = req.headers["username"];
    var usernameAvailable = true;
    var i = 0;

    for(i = 0; i < users.length; i++){
      if(usernameRequested == users[i]["username"]){
        usernameAvailable = false;
      }
    }

    if(usernameAvailable){
      var user = {"username":req.headers["username"], "forename":req.headers["forename"], "surname":req.headers["surname"], "password":req.headers["password"]};
      users.push(user);
      console.log("user added.");
      const username = req.headers["username"];
      resp.send(
        {"response" : "User with username " + username +" created!"}
      );
    }else{
      resp.status(400);
      resp.send("Username already taken");
    }
  }else{
    resp.status(403);
    resp.send("Invalid token.");
  }


});

app.get('/people', function(req,resp){
  resp.send(users);
});

app.get('/people/:username', function(req,resp){
  var i =0;
  for(i = 0; i < users.length; i++){
    if (req.params.username == users[i]["username"]){
      resp.send(users[i]);
    }
  }
});

app.get('/comments', function(req,resp){
  resp.send({"reviews": reviews});
})

app.post('/comments',
   passport.authenticate('bearer', { session: false }),
   function(req, resp){
     var review = [req.body["username"], req.body["review"]];
     reviews.push(review);
     resp.send({"reviews": reviews});
});

module.exports = app;
