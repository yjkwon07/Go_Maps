const express = require('express');
const util = require('util');
const googleMaps = require('@google/maps');

const History = require('../schemas/history');
const Favorite = require('../schemas/favorites');

const router = express.Router();
const googleMapsClient = googleMaps.createClient({
    key: process.env.PLACES_API_KEY,
});

router.get('/', async (_req, res) => {
    try {
        const favorites = await Favorite.find({});
        const histories = await History.find({}).limit(10).sort("-createdAt");
        res.render('index', {
            isfavoriate: false,
            results: favorites,
            histories: histories,
            Google_Key: process.env.PLACES_API_KEY
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/autocomplete/:query', (req, res, next) => {
    googleMapsClient.placesQueryAutoComplete({
        input: req.params.query,
        language: 'ko',
    }, (err, response) => {
        if (err) {
            return next(err);
        }
        return res.status(200).json({ 
            predictions: response.json.predictions,
            message: "SEARCH DONE"
        });
    });
});

router.get('/search/:searchQuery', async (req, res, next) => {
    const googlePlaces = util.promisify(googleMapsClient.places);
    const googlePlacesNearby = util.promisify(googleMapsClient.placesNearby);
    const histories = await History.find({}).limit(10).sort("-createdAt");
    const { lat, lng, type } = req.query;
    try {
        const history = new History({ query: req.params.searchQuery });
        await history.save();
        let response;
        if (lat && lng) {
            response = await googlePlacesNearby({
                keyword: req.params.searchQuery,
                location: `${lat}, ${lng}`,
                rankby: 'distance',
                language: 'ko',
                type,
            });
        } else {
            response = await googlePlaces({
                query: req.params.searchQuery,
                language: 'ko',
                type,
            });
        }
        res.render('result', {
            title: `${req.params.searchQuery}결과`,
            results: response.json.results,
            histories: histories,
            Google_Key: process.env.PLACES_API_KEY,
            isfavoriate: true,
            query: req.params.searchQuery,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/location/:id/favorite', async (req, res, next) => {
    try {
        const favoriate = new Favorite({
            placeId: req.params.id,
            name: req.body.name,
            location: [req.body.lng, req.body.lat],
        });
        await favoriate.save();
        res.status(200).json({ 
            favoriate,
            message: "CREATE DONE",
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/location/:id/favorite', async (req, res, next) => {
    try {
        const favoriate = await Favorite.remove({ placeId: req.params.id });
        res.status(200).json({
            favoriate,
            message: "DELETE DONE",
        });
    } catch (error) {
        console.err(error);
        next(error);
    }
})
module.exports = router;