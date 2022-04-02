const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Role = require('../models/mainModel');
const Review = require('../models/review');
const Joi = require('joi');
const flash = require('connect-flash');
const { isLoggedIn, isAuthor } = require('../middleware');



router.get('/', async (req, res) => {
    const roles = await Role.find({});
    // console.log(roles);
    res.render('opports/index', { roles });
})

//creating new opportunity
router.get('/new', isLoggedIn, (req, res) => {
    res.render('opports/new');
})
router.post('/', isLoggedIn, catchAsync(async (req, res, next) => {

    // const roleSchema = Joi.object({
    //     role: Joi.object({
    //         cName: Joi.string().required(),
    //         role: Joi.string().required(),
    //         description: Joi.string().required()
    //     }).required()
    // })
    // const result = roleSchema.validate(req.body);
    // if (result.error) {
    //     throw new ExpressError(result.error.details, 400)
    // }
    // console.log(result);
    const role = new Role(req.body);
    //console.log(req.body);
    var myString = role.skills[0];
    const MyArray = myString.split(',');
    role.skills = MyArray;
    role.author = req.user._id;
    await role.save();
    //console.log(role);
    req.flash('success', 'Successfully posted a role!');
    res.redirect(`allOpports/${role._id}`);
}))
router.get('/:id', catchAsync(async (req, res) => {
    const role = await (await Role.findById(req.params.id).populate('reviews').populate('author'));
    //used to populate author in review array to extract author value
    for (let review in role.reviews) {
        const rev = role.reviews[review];
        await (rev.populate('author'));
    }
    // console.log(role);
    if (!role) {
        req.flash('error', 'Not found that role');
        return res.redirect('/allOpports');
    }
    res.render('opports/show', { role })
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
        req.flash('error', 'Not found that role');
        return res.redirect('/allOpports');
    }

    res.render('opports/edit', { role });
}));

router.put('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;

    const role = await Role.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })
    // console.log(req.body);
    req.flash('success', 'Sccessfully updated a role!')
    res.redirect(`/allOpports/${role._id}`);
}));
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Role.findByIdAndDelete(id);
    res.redirect('/allOpports');
}));

module.exports = router;