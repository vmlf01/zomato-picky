/**
 * Module dependencies.
 */
var path = require('path');
var mongoose = require('mongoose');

var config = require('../config/config');

// Load the mongoose models
module.exports.loadModels = function (cb) {
  require('../models/visual_search');

  //config.files.server.models.forEach(function (modelPath) {
  //  require(path.resolve(modelPath));
  //});

  if (cb) cb();
};

// Initialize Mongoose
module.exports.connect = function (cb) {
  var _this = this;

  var db = mongoose.connect(config.db.uri, config.db.options, function (err) {
    // Log Error
    if (err) {
      console.error('Could not connect to MongoDB!');
      console.log(err);
      cb(err);
    } else {

      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (cb) cb(null, db);
    }
  });
};

module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    console.info('Disconnected from MongoDB.');
    cb(err);
  });
};
