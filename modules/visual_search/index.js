var url = require('url');
var express = require('express');
var router = express.Router();

var config = require('../../config/config');

var visualSearch = require('./visual_search');

router.get('/:id', function(req, res, next) {

  var searchId = req.params.id;

  visualSearch.getSearch(searchId, function (err, details) {
    if (err) {
      res.status(404);
      res.end();
    }
    else {
      res.status(200).send(details);
    }
  });
});

router.put('/', function (req, res, next) {
  // TODO: get geo location coordinates from request params
  var lat = 38.703472;
  var lon = -9.178859;

  visualSearch.newSearch(lat, lon, function (err, details) {
    res.location(url.resolve(req.baseUrl, '/' + details.id));
    res.status(201).send(details);
  });
});

module.exports = router;
