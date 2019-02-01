const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const githubStrategy = require("passport-github").Strategy;
const mongoose = require("mongoose")


require("dotenv").config();
const User = require("./models/users.js")

console.log(process.env.CLIENT_ID)
console.log(process.env.CLIENT_SECRET)

const app = express();
const port = process.env.PORT || 3000;

//Apply Middleware
app.use(require('express-session')({ secret: "hsdfgmsh234sd", resave: true, saveUninitialized: true, maxAge: 24 * 60 * 1000 }));
app.use(cors());
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.Promise = global.Promise
mongoose.connect(process.env.mongoURL, { useNewUrlParser: true }, () => {
        console.log("successfully connected to mongodb")
    })
    //Authentication Middleware
passport.use(new githubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://book-trading-iliyas.herokuapp.com/auth/github/callback"
}, (accessToken, refreshToken, profile, cb) => {
    console.log(profile)
    User.findOrCreate({ username: profile.username, fullname: profile.displayName }).then((err, user) => {
        console.log(user)
        cb(err, user)
    })
}));
//serialize session
passport.serializeUser((user, done) => {
    done(null, user);
});
//deserialize session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

require("./routes/routes")(app)
    //Start the server
app.listen(port, () => console.log(`server is up at port ${port}`));