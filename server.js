const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const passport = require("passport")
const githubStrategy = require("passport-github").Strategy
const app = express()
const port = process.env.PORT || 3000

//Apply Middleware
app.use(cors())
app.use(morgan("combined"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Authentication Middleware
//passport.use(new githubStrategy({}))

//Start the server
app.listen(port, () => console.log(`server is up at port ${port}`))