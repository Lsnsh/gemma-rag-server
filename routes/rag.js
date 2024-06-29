var express = require('express');
var router = express.Router();

/* GET RAG listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a rag resource');
});

module.exports = router;
