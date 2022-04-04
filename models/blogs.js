const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');

const blogSchema = new Schema({
    description: String,
    date: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
})
module.exports = mongoose.model('Post', blogSchema);