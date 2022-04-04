const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
router.get('/register', function (req, res) {
    res.render('user/register');
});
router.post('/register', catchAsync(async function (req, res, next) {
    try {
        const { email, username, password } = req.body;
        const newuser = new User({ username, email });
        const registeredUser = await User.register(newuser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            else {
                req.flash('success', 'welcome');
                res.redirect('/allopports');
            }
        })

    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }

}));

router.get('/login', (req, res) => {
    res.render('user/login');
});
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    const urlToGo = req.session.returnTo || '/allOpports';
    delete req.session.returnTo;
    res.redirect(urlToGo);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!!');
    res.redirect('/');
})

module.exports = router;