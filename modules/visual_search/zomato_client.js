var request = require('request');
var url = require('url');
var _ = require('lodash');
var async = require('async');

var config = require('../../config/config');

var executeZomatoRequest = function (params, cb) {
    var reqParams = {
        headers: {
            'Accept': 'application/json',
            'user_key': config.zomato.apiKey
        }
    };

    _.merge(reqParams, params);

    request.get(reqParams, function (err, response, body) {
        if (err) {
            cb(err);
        }
        else {
            cb(null, JSON.parse(body));
        }
    });
}

var getZomatoLocation = function (geoloc, cb) {
    //var zomatoResponse = require('./geocode.json');
    // cb(null, zomatoResponse);

    var params = {
        url: url.resolve(config.zomato.apiUrl, 'geocode'),
        qs: {
            lat: geoloc.lat,
            lon: geoloc.lon
        }
    };

    async.waterfall([
        async.apply(executeZomatoRequest, params),
        processLocationResponse
    ], cb);

};

var processLocationResponse = function (response, cb) {
    try {
        var location = {
            geoloc: [response.location.longitude, response.location.latitude],
            name: response.location.title,
            cityName: response.location.city_name,
            cityId: response.location.city_id,
            entityType: response.location.entity_type || 'subzone',
            entityId: response.location.entity_id || response.popularity.subzone_id
        };

        cb(null, location);
    }
    catch (ex) {
        console.log('Error', ex);
        cb(new Error('Error parsing location response'));
    }
};

var getZomatoBestRated = function (loc, cb) {

    var params = {
        url: url.resolve(config.zomato.apiUrl, 'location_details'),
        qs: {
            entity_type: loc.entityType,
            entity_id: loc.entityId
        }
    };

    async.waterfall([
        async.apply(executeZomatoRequest, params),
        processBestRatedResponse
    ], cb);

};

var processBestRatedResponse = function (response, cb) {
    try {
        async.map(response.best_rated_restaurant, function (record, callback) {
           callback(null, {
                id: record.restaurant.id,
                name: record.restaurant.name,
                cuisines: record.restaurant.cuisines
           });
        }, cb);
    }
    catch (ex) {
        console.log('Error', ex);
        cb(new Error('Error parsing best restaurants response'));
    }
};

var getZomatoRestaurantImages = function (restaurant, cb) {

    var params = {
        url: url.resolve(config.zomato.apiUrl, 'restaurant'),
        qs: {
            res_id: restaurant.id
        }
    };

    async.waterfall([
        async.apply(executeZomatoRequest, params),
        processImagesResponse
    ], cb);
};

var processImagesResponse = function (restaurant, cb) {
    console.log('restaurant', restaurant);
    var photo = null;

    if (restaurant.photos) {
        var randomIndex = getRandomInt(0, restaurant.photos.length);
        photo = restaurant.photos[randomIndex].url;
    }
    else if (restaurant.featured_image) {
        photo = restaurant.featured_image;
    }

    cb(null, photo);
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.getLocationDetails = getZomatoLocation;

module.exports.getBestRatedRestaurants = getZomatoBestRated;

module.exports.getRestaurantImages = getZomatoRestaurantImages;