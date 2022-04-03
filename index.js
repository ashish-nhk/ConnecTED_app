if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const express = require('express');
const res = require('express/lib/response');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const MongoDBStore = require("connect-mongo");
//const catchAsync = require('./utils/catchcAsync');
//const Joi = require('joi');
//const Review = require('./models/review');
//const Role = require('./models/mainModel');


const allOpportRoutes = require('./routes/allOpports');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
//use static files in app.js
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'partials')));
//'mongodb://localhost:27017/hireDB'
const dbURL = process.env.dbURL;
const secret = process.env.secret;
//
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});
const store = new MongoDBStore({
    mongoUrl: dbURL,
    secret: secret,
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
    // console.log(req.user);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/allOpports', allOpportRoutes);
app.use('/allOpports/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', function (req, res, next) {
    next(new ExpressError('Page Not found', 404))
});

app.use((err, req, res, next) => {
    const { message = 'Something went wrong', statusCode = 500 } = err;
    res.status(statusCode).render('opports/error', { message });
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

