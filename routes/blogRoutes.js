const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const flash = require('connect-flash');
const Blog = require('../models/blogs');
const { isLoggedIn } = require('../middleware');

router.get('/blogs', isLoggedIn, async (req, res) => {
    const blogs = await Blog.find({}).populate('author');
    for (let blog in blogs) {
        const rev = blogs[blog];
        await (rev.populate('author'));
    }
    // console.log(blogs);

    res.render('blogs', { blogs });
});

const isLogged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!');
        req.session.returnTo = '/blogs';
        return res.redirect('/login');
    }
    next();
}
router.post('/blogs', isLogged, catchAsync(async (req, res) => {
    const { description } = req.body;
    const date = new Date(Date.now()).toString().slice(4, 24);
    const post = new Blog({ description: description, date: date });
    post.author = req.user._id;
    // await post.populate('author');
    await post.save();
    console.log(post);
    res.redirect('/blogs');
}));

router.delete('/blogs/:id', isLoggedIn, catchAsync(async function (req, res) {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    res.redirect('/blogs/');
}));
module.exports = router;