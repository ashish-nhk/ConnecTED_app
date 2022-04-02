const express = require('express');
const router = express.Router({ mergeParams: true });
// merge params is used to merge params used when passing id through router
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


const Role = require('../models/mainModel');
const Review = require('../models/review');

router.post('/', catchAsync(async (req, res) => {
    const role = await Role.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    // console.log(review.author);
    await review.save();
    role.reviews.push(review);
    await role.save();
    // for (let rev of role.reviews)
    //     console.log(rev.author);

    res.redirect(`/allOpports/${role._id}`);
}));

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!');
        req.session.returnTo = `/allOpports/${req.params.id}`;
        return res.redirect('/login');
    }
    next();
}
const isAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You have not permission bro!!');
        return res.redirect(`/allOpports/${id}`);
    }
    next();
}
///allOpports/:id/reviews
router.delete('/:reviewId', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Role.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/allOpports/${id}`);
}))

module.exports = router;