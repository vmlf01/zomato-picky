var async = require('async');
var mongoose = require('mongoose');
var VisualSearch = mongoose.model('VisualSearch');
var zomatoClient = require('./zomato_client');

var getCuisineTypes = function (restaurants, cb) {

    var cuisineTypes = [];

    async.map(restaurants, function (restaurant, cb) {
        var types = restaurant.cuisines.split(',');

        types.forEach(function (cuisineType) {
            cuisineType = cuisineType.trim();
            if (cuisineTypes.indexOf(cuisineType) === -1) {
                cuisineTypes.push(cuisineType);
            }
        });

        cb();
    }, function (err, results) {
        if (err) {
            return cb(err);
        }

        cb(null, cuisineTypes.map(function (ct) {
            return {
                name: ct,
                rating: 0
            };
        }));
    });

};

var getImages = function (restaurant, cb) {

    zomatoClient.getRestaurantImages(restaurant, function (err, image) {
        cb(null, {
            url: image,
            cuisines: []
        });
    });
};

module.exports.newSearch = function (lat, lon, cb) {
    var loc = {
        lat: lat,
        lon: lon
    };

    zomatoClient.getLocationDetails(loc, function (err, locationDetails) {

        if (err) {
            return cb(err);
        }

        zomatoClient.getBestRatedRestaurants(locationDetails, function (err, restaurants) {

            async.parallel([
                async.apply(getCuisineTypes, restaurants),
                async.apply(async.parallel, restaurants.map(function (restaurant) {
                    return async.apply(getImages, restaurant);
                }))
            ], function (err, results) {
                if (err) {
                    return cb(err);
                }

                var search = new VisualSearch({
                    dateCreated: new Date(),
                    currentStatus: 'new',
                    location: locationDetails,
                    cuisines: results[0],
                    images: results[1]
                });

                /*

                search.save(function (err, doc) {
                    if (err) {
                        return cb(err);
                    }

                    cb(null, doc);
                });

                */
                console.log('search', search);
                cb(null, search);
            });
        });

    });
};

module.exports.updateSearch = function (search, cb) {

}

module.exports.getSearch = function (id, cb) {
    var search = VisualSearch.findById(id, cb);
}