var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/video', function(req, res, next) {
  res.render('Video');
});

router.get("*", function(req, res){
	
	res.status(404).send("Página no encontrada :( en el momento");

});


module.exports = router;