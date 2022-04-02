const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Review = require('./review');
const roleSchema = new Schema({
    cName: String,
    role: {
        type: String,
        required: true,
    },
    skills: {
        type: [String]
    },
    aboutC: String,
    lastDate: String,
    description: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]

})

roleSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Role', roleSchema);