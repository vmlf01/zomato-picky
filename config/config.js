'use strict';

var _ = require('lodash');
var glob = require('glob');
var fs = require('fs');
var path = require('path');

var validateEnvironmentVariable = function () {
    var environmentFiles = glob.sync('./config/env/' + process.env.NODE_ENV + '.js');
    console.log();
    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            console.error('+ Warn: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead');
        } else {
            console.error('+ Warn: NODE_ENV is not defined! Using default development environment');
        }
        process.env.NODE_ENV = 'development';
    }
};

/**
 * Initialize global configuration
 */
var initGlobalConfig = function () {
    // Validate NODE_ENV existence
    validateEnvironmentVariable();

    // Get the default config
    var defaultConfig = require(path.join(process.cwd(), 'config/env/default'));

    // Get the current config
    var environmentConfig = require(path.join(process.cwd(), 'config/env/', process.env.NODE_ENV)) || {};

    // Merge config files
    var config = _.merge(defaultConfig, environmentConfig);

    // We only extend the config object with the local.js custom/local environment if we are on
    // production or development environment. If test environment is used we don't merge it with local.js
    // to avoid running test suites on a prod/dev environment (which delete records and make modifications)
    if (process.env.NODE_ENV !== 'test') {
        config = _.merge(config, (fs.existsSync(path.join(process.cwd(), 'config/env/local.js')) && require(path.join(process.cwd(), 'config/env/local.js'))) || {});
    }

    return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
