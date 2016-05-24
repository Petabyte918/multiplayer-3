var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
require('../models/user');
require('./passport')(passport);



router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook',
  { successRedirect: '/profile', 
    failureRedirect: '/' }));

router.get('/juego', function(req, res, next) {
  if(req.user){
  	res.render('juego',{user:req.user});
 }else{
  	res.render('index');
  }
});

router.get('/profile', function(req, res, next) {
if(req.user){
	res.render('profile',{
  	title: 'Perfil',
  	user: req.user
  });
}else{
	res.render('index');
}
});

router.get('/juegoroms', function(req, res, next) {
  if(req.user){
    res.render('juegoroms',{user:req.user});
  }else{
    res.render('index');
  }
});

router.get("*", function(req, res){
	
	res.status(404).send("Página no encontrada :( en el momento");

});


module.exports = router;