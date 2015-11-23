'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    uri: (process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://ds057234.mongolab.com:57234') + '/zomato_visual_searches_dev',
    options: {
      user: 'zomato',
      pass: 'zomato.tomato'
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  zomato: {
    apiUrl: 'https://developers.zomato.com/api/v2.1/',
    apiKey: process.env.ZOMATO_KEY || 'a7501616e43e2cb08e91bfc32bbc8b3a'
  }
};
