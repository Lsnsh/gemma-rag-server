var express = require('express');
var router = express.Router();

/* GET prepare(generate vector db static file) listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a status');
});

module.exports = router;
