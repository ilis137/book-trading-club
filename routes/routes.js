const passport = require("passport")
const User = require("../models/users")
const Book = require("../models/books")
const Request = require("../models/requests")
module.exports = app => {
    app.get("/", (req, res) => {
        console.log("home")
        res.redirect("/books")
    })
    app.get("/auth/github", passport.authenticate("github"))

    app.get("/auth/github/callback", passport.authenticate("github", { successRedirect: "/books", failureRedirect: "/" }))

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
            res.render("editInfo", { username: username, fullname: fullname, city: city, address: address, user: req.user })
        }).catch(err => {
            if (err) throw err
        })
    })

    //API to get userInfo
    app.get("/UserInfo", require("connect-ensure-login").ensureLoggedIn(), (req, res) => {
        const { username } = req.body
        User.findOne({ username: username }).then((user, err) => {
            const { username, fullname, city, address } = user
            res.render("userInfo", { username: username, fullname: fullname, city: city, address: address, user: req.user })
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
            res.render("addBook", { books: books, user: req.user })
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
            books.map((book) => {
                User.find({ username: book.ownersname }).then(user => {
                    if (user.city)
                        book.city = user.city
                    else
                        book.city = ""

                }).catch(err => { throw (err) })

            })
            res.render("Books", { books: books, user: req.user })

        }).catch(err => {
            throw (err)
        })
    })

    //API to select book to give
    app.get("/select/book/give", (req, res) => {
        const { username } = req.user
        Book.find({ ownersname: req.user.username }).then(books => {

            res.render("Books", { books: books, user: req.user })
        }).catch(err => { throw (err) })
    })

    app.post("/select/book/give", (req, res) => {

    })


    //API to select book to take
    app.get("/select/book/take", (req, res) => {
        const { username } = req.user
        Book.find({}).then(books => {
            books = books.filter((book) => book.ownersname !== username)
            books.map((book) => {
                User.find({ username: book.ownersname }).then(user => {
                    if (user.city)
                        book.city = user.city
                    else
                        book.city = ""

                }).catch(err => { throw (err) })

            })
            res.render("Books", { books: books, user: req.user })
        }).catch(err => { throw (err) })
    })

    //API to make a request
    app.post("/makeRequest", (req, res) => {
        const { requestersName, offeredBook, requestedBook, ownersname } = req.body
        const request = new Request({
            requestersName: requestersName,
            offeredBook: offeredBook,
            requestedBook: requestedBook,
            ownersname: ownersname,
            status: "pending"
        })
        request.save().then((request) => {
            res.redirect("/books")
        }).catch(err => {
            throw (err)
        })
    })

    //API to get my requests
    app.get("/createRequests", (req, res) => {
        const { username } = req.user
        request.find({ requestersName: username }).then((requests) => {
            res.render("requests", {
                requests: requests,
                user: req.user
            })
        })
    })

    //API to delete my request
    app.delete("/delete/request", (req, res) => {
            const { id } = req.body
            request.findByIdAndDelete(id).then(() => {
                res.redirect("/createRequests")
            })
        })
        //API to accept request
    app.post("/accept/request", (req, res) => {
            const { id } = req.body
            request.findByIdAndUpdate(id, { status: "completed" }, { new: true }).then(() => {
                res.redirect("/books")
            }).catch(err => { throw (err) })
        })
        //API to cancel request
    app.post("/cancel/request", (req, res) => {
        const { id } = req.body
        request.findByIdAndUpdate(id, { status: "canceled" }, { new: true }).then(() => {
            res.redirect("/books")
        }).catch(err => { throw (err) })
    })
}