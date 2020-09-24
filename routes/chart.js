var express = require('express');
var router = express.Router();

/* GET chart page., this is a canvasjs chart displayed using HTML inside of a JADE template*/
// localhost:3000/chart for testing
router.get('/', function(req, res, next) {
  res.render('canvaschart');  //render the chart view
});


//http://localhost:3000/chart/slider for testing
router.get('/slider', function(req, res, next) {
    res.render('slider');  //render the slider view
  });

module.exports = router;




