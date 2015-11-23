var mongoose = require('mongoose');

var visualSearchSchema = mongoose.Schema({
    dateCreated: {
        type: Date
    },
    location: {
        geoloc: {
            type: [Number], //[lon, lat]
            index: '2d'
        },
        name: {
            type: String
        },
        cityName: {
            type: String
        },
        cityId: {
            type: String
        },
        entityType: {
            type: String
        },
        entityId: {
            type: String
        }
    },
    currentStatus: {
        type: String,
        enum: ['new', 'in-progess', 'finished']
    },
    cuisines: {
        type: [{
            name: {
                type: String
            },
            rating: {
                type: Number
            }
        }]
    },
    images: {
        type: [{
            url: {
                type: String
            },
            cuisines: {
                type: [String]
            }
        }]
    }
});

module.exports = mongoose.model('VisualSearch', visualSearchSchema);
