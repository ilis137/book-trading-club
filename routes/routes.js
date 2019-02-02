const passport = require("passport")
const User = require("../models/users")
const Book = require("../models/books")
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



    //API to add a book for trade
    app.post("/books/my", (req, res) => {
        const { username } = req.user
        const { title, author } = req.body
        const book = new Book({
            title: title,
            author: author,
            ownersname: username
        })

        Book.save().then(book => {
            res.redirect("/books/my")
        }).catch(err => {
            throw (err)
        })
    })

    //API to get my books for trade
    app.get("/books/my", (req, res) => {
        const { username } = req.user
        Book.find({ ownersname: username }).then((books) => {
            res.render("addBook", { books: books })
        }).catch(err => {
            throw (err)
        })

    })

    //API to delete a book for trade
    app.delete("/books/my", (req, res) => {
            const { username } = req.user
            const { title } = req.body

            Book.findOneAndDelete({ ownersname: username, title: title }).then(() => {
                res.redirect("/books/my")
            }).catch(err => {
                throw (err)
            })
        })
        //API to get all books for trade
    app.get("/books", (req, res) => {

            Book.find({}).then((books) => {
                User.find({ username: username }).then(user => {
                    res.render("Books", { books: books, ownersname: user.username, city: user.city })
                }).catch(err => { throw (err) })

            }).catch(err => {
                throw (err)
            })
        })
        //API 

    // app.get("/")
}