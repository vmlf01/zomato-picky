'use script';

var async = require('async');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('./config/config');
var mongoose = require('./lib/mongoose');

var initApp = function (cb) {
  async.series([
      mongoose.loadModels,
      mongoose.connect,
      initExpress
  ], function (err, results) {
    if (err) {
      return cb(err);
    }
    cb(null, results[2]);
  });
};

var initExpress = function (cb) {
  var visualSearch = require('./modules/visual_search');

  var app = express();

  app.locals.zomatoKey = config.zomato.apiKey;

  app.use(logger('dev'));
  app.use(bodyParser.json());

  app.use('/search', visualSearch);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send({
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: {}
    });
  });

  if (cb) cb(null, app);
};

module.exports.init = initApp;