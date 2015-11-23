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
// zomato restaurant api only provides photos to partners
// so get pictures from site backend page
// https://www.zomato.com/php/load_more_res_pics.php
    // res_id = restaurant.id
    //
    /*
     {
     "html": "\n                    <a href='#' draggable='true' style='background-image: none;' class='photo-inner js-heart-container' data-photo_id='r_ODIzMjEwOTQxOT'><span class='photo-like-icon js-fp-like no-events' data-icon='f'></span><img class='res-photo-thumbnail thumb-load lazy' data-type='res' data-photo_id='r_ODIzMjEwOTQxOT'  data-index='1' data-original='https://c.zmtcdn.com/data/pictures/2/8201122/afe22753fb243b15a0894556e1fdbf06_200_thumb.jpg' src='https://d.zmtcdn.com/images/photoback.png' /></a>\n
     }
     */

    var reqParams = {
        url: 'https://www.zomato.com/php/load_more_res_pics.php',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'res_id=' + restaurant.id
    };

    request.post(reqParams, function (err, response, body) {
        if (err) {
            cb(err);
        }
        else {
            var photos = [];
            var match;
            var photosRegex = / src='(.*?)'/g;

            while((match = photosRegex.exec(body)) !== null) {
                photos.push(match[1]);
            }
            console.log(photos);

            var randomIndex = getRandomInt(0, photos.length);
            var photo = photos[randomIndex].replace(/\\/g, '');

            cb(null, photo);
        }
    });
/*
    async.waterfall([
        async.apply(executeZomatoRequest, params),
        processImagesResponse
    ], cb);
    */
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