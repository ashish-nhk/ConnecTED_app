const Role = require('./models/mainModel');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role.author.equals(req.user._id)) {
        req.flash('error', 'You have not permission bro!!');
        return res.redirect(`/allOpports/${id}`);
    }
    next();
}
