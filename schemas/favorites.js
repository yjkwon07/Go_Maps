const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema({
    placeId: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    // 몽고 DB에 경도, 위도 같은 것을 저장하면 효율적으로 처리할 수 있다. 
    // 2dsphere가 위와같은 역할을 한다.
    location: {
        type: [Number],
        index: '2dsphere'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Favorite', favoriteSchema);