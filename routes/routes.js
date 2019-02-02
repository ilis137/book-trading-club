const passport = require("passport")
const User = require("../models/users")
module.exports = app => {

    app.get("/auth/github", passport.authenticate("github"))

    app.get("/auth/github/callback", passport.authenticate("github", { successRedirect: "/books", failureRedirect: "/login" }))

    //API to Edit user Info
    app.put("/editInfo", (req, res) => {
            const { username, fullname, city, address } = req.body
            User.findOneAndUpdate({ username: username }, { username: username, fullname: fullname, city: city, address: address }, { new: true }).then((user, err) => {
                res.redirect("/userInfo")
            }).catch(err => {
                if (err) throw err
            })
        })
        //API to get info for Editing profile
    app.get("/editInfo", (req, res) => {
        const { username } = req.body
        User.findOne({ username: username }).then((user, err) => {
            const { username, fullname, city, address } = user
            res.render("editInfo", { username: username, fullname: fullname, city: city, address: address })
        }).catch(err => {
            if (err) throw err
        })
    })

    //API to get userInfo
    app.get("/UserInfo", require("connect-ensure-login").ensureLoggedIn(), (req, res) => {
        const { username } = req.body
        User.findOne({ username: username }).then((user, err) => {
            const { username, fullname, city, address } = user
            res.render("userInfo", { username: username, fullname: fullname, city: city, address: address })
        }).catch(err => {
            if (err) throw err
        })
    })

}