const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const githubStrategy = require("passport-github").Strategy;
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();
const User = require("./models/users.js");

console.log(process.env.CLIENT_ID);
console.log(process.env.CLIENT_SECRET);

const app = express();
const port = process.env.PORT || 3000;

//set view engine
app.set("views", "./views");
app.set("view engine", "ejs");

//Apply Middleware
app.use(
  require("express-session")({
    secret: "hsdfgmsh234sd",
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 1000
  })
);

app.use("/assets", express.static(__dirname + "/assets"));

app.use(cors());
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

//connect to  mongodb
mongoose.Promise = global.Promise;
mongoose.connect(process.env.mongoURL, { useNewUrlParser: true }, () => {
  console.log("successfully connected to mongodb");
});

//Authentication Middleware
passport.use(
  new githubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL:
        "https://book-trading-iliyas.herokuapp.com/auth/github/callback"
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreate({
        username: profile.username,
        fullname: profile.displayName,
        city: "",
        address: ""
      }).then((user, err) => {
        return cb(err, user);
      });
    }
  )
);

//serialize session
passport.serializeUser((user, done) => {
  done(null, user.doc);
});

//deserialize session

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

require("./routes/routes")(app);

//Start the server
app.listen(port, () => console.log(`server is up at port ${port}`));
