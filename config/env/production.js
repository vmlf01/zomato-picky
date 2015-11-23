'use strict';

module.exports = {
  port: process.env.PORT || 8443,
  db: {
    uri: (process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://ds057254.mongolab.com:57254') + '/zomato_visual_searches',
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
