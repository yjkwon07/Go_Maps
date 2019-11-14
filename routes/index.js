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
    try{
        const favorites = await Favorite.find({});
        res.render('index', {
            isfavoriate: false,
            results : favorites,
            Google_Key: process.env.PLACES_API_KEY 
        })
    }catch(error){
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
        return res.status(200).json(response.json.predictions);
    });
});

router.get('/search/:query', async (req, res, next) => {
    const googlePlaces = util.promisify(googleMapsClient.places);
    const { type } = req.query;
    try {
        const history = new History({ query: req.params.query });
        await history.save();
        const response = await googlePlaces({
            query: req.params.query,
            language: 'ko',
            type,
        });
        res.render('result', {
            title: `${req.params.query}결과`,
            results: response.json.results,
            Google_Key: process.env.PLACES_API_KEY,
            isfavoriate: true,
            query: req.params.query,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/location/:id/favorite', async (req, res, next) => {
    try{
        const favoriate = new Favorite({
            placeId: req.params.id,
            name: req.body.name,
            location: [req.body.lng, req.body.lat],
        });
        await favoriate.save();
        res.status(200).send(favoriate);
    }catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;