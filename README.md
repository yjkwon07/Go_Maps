# go_maps

## 2dsphere 
몽고 DB에 경도, 위도 같은 것을 저장하면 효율적으로 처리할 수 있다. (2dsphere가 위와같은 역할을 한다.)

몽고DB에 경도, 위도 같은 것을 저장하면 효율적으로 처리할 수 있다.(순서가 중요하다.)
```javascript
    const mongoose = require('mongoose');
    const { Schema } = mongoose;

    const favoriteSchema = new Schema({
        // .... 
        location: {
            type: [Number],
            index: '2dsphere'
        },
        // ....
    });

    module.exports = mongoose.model('Favorite', favoriteSchema);
```

```javascript
    const favoriate = new Favorite({
        placeId: req.params.id,
        name: req.body.name,
        location: [req.body.lng, req.body.lat],
    });
```

## @google/maps
npm 모듈을 사용하여 지도 검색 기능 활성화 
```javascript
    const googleMaps = require('@google/maps');
    const googleMapsClient = googleMaps.createClient({
        key: process.env.PLACES_API_KEY,
    });
```

## Autosearch Place 
**placesQueryAutoComplete**

자동 검색
```javascript
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
```

## navigator.geolocation.getCurrentPosition
**현재 위치** 검색 허용 선택 

```javascript
    navigator.geolocation.getCurrentPosition(function (position) {
        var search = document.querySelector('#search');
        var type = document.querySelector('#type').value;
        if (!search.value || !search.value.trim()) {
            alert('검색명을 기입해 주세요.');
            search.focus();
            return false;
        }
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        location.href = `/search/${search.value.trim()}?lat=${lat}&lng=${lng}&type${type}`;
    }, function () {
        alert('내 위치 확인 권한을 허용하세요.');
    }, {
        // 정확한 위치를 파악할 것인가? (베터리 소모가 많이 든다.)
        enableHighAccuracy: false,
        // 현재 위치를 얼마동안 저장할지 (캐쉬 역할)
        maximumAge: 0,
        // 요청을 얼마동안 기다릴 것인가?
        timeout: Infinity
    });
```

## search 
**places**: 장소 검색  

**placesNearby**: 근방 검색 
```javascript
    router.get('/search/:searchQuery', async (req, res, next) => {
        const googlePlaces = util.promisify(googleMapsClient.places);
        const googlePlacesNearby = util.promisify(googleMapsClient.placesNearby);
        const histories = await History.find({}).limit(10).sort("-createdAt");
        const { lat, lng, type } = req.query;
        try {
            const history = new History({ query: req.params.searchQuery });
            await history.save();
            let response;
            if(lat && lng) {
                response = await googlePlacesNearby({
                    keyword: req.params.searchQuery,
                    location: `${lat}, ${lng}`,
                    // 오름차순 정하기(distance: 거리)
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
                title: `${req.params.query}결과`,
                results: response.json.results,
                Google_Key: process.env.PLACES_API_KEY,
                isfavoriate: true,
                query: req.params.searchQuery,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
   });
```