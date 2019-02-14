const passport = require("passport");
const User = require("../models/users");
const Book = require("../models/book");
const Request = require("../models/requests");
module.exports = app => {
  app.get("/", (req, res) => {
    console.log("home");
    res.redirect("/books");
  });
  app.get("/auth/github", passport.authenticate("github"));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", {
      successRedirect: "/books",
      failureRedirect: "/"
    })
  );

  //API to Edit user Info
  app.put("/editInfo", (req, res) => {
    const { username, fullname, city, address } = req.body;
    console.log(req.body);
    User.findOneAndUpdate(
      { username: username },
      {
        $set: {
          username: username,
          fullname: fullname,
          city: city,
          address: address
        }
      },
      { new: true }
    )
      .then((user, err) => {
        res.redirect("/UserInfo");
      })
      .catch(err => {
        if (err) throw err;
      });
  });
  //API to get info for Editing profile
  app.get("/editInfo", (req, res) => {
    const { username } = req.user;
    User.findOne({ username: username })
      .then((user, err) => {
        const { username, fullname, city, address } = user;
        res.render("editInfo", {
          username: username,
          fullname: fullname,
          city: city,
          address: address,
          user: req.user
        });
      })
      .catch(err => {
        if (err) throw err;
      });
  });

  //API to get userInfo
  app.get(
    "/UserInfo",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {
      const { username } = req.user;
      User.findOne({ username: username })
        .then((user, err) => {
          const { username, fullname, city, address } = user;
          res.render("userInfo", {
            username: username,
            fullname: fullname,
            city: city,
            address: address,
            user: req.user
          });
        })
        .catch(err => {
          if (err) throw err;
        });
    }
  );

  //API to add a book for trade
  app.post("/books/my", (req, res) => {
    const { username } = req.user;
    const { title, author } = req.body;
    const book = new Book({
      title: title,
      author: author,
      ownersname: username
    });

    book
      .save()
      .then(book => {
        res.redirect("/books/my");
      })
      .catch(err => {
        throw err;
      });
  });

  //API to get my books for trade
  app.get("/books/my", (req, res) => {
    const { username } = req.user;
    Book.find({ ownersname: username })
      .then(books => {
        console.log(books);
        res.render("addBook", { books: books, user: req.user });
      })
      .catch(err => {
        throw err;
      });
  });

  //API to delete a book for trade

  app.delete("/books/my", (req, res) => {
    const { id } = req.body;
    Book.findByIdAndDelete(id)
      .then(() => {
        res.redirect("/books/my");
      })
      .catch(err => {
        throw err;
      });
  });
  //API to get all books for trade
  app.get("/books", async (req, res) => {
    //console.log(req.user);

    let books = await Book.find({});
    let newBooks = [];
    //console.log(books);
    usersPromises = books.map(book => {
      let userPromise = User.findOne({ username: book.ownersname });
      return userPromise;
    });
    const users = await Promise.all(usersPromises);
    let i = 0;
    books = books.map(book => {
      if (users[i].city) {
        book.city = users[i].city;
      } else {
        book.city = "";
      }
      i++;
      return book;
    });

    //res.send(books);
    res.render("books", { books: books, user: req.user, url: "" });
  });

  //API to select book to give
  app.get("/select/book/give", (req, res) => {
    const { username } = req.user;
    Book.find({ ownersname: username })
      .then(books => {
        res.render("books", {
          books: books,
          user: req.user,
          url: req.route.path
        });
      })
      .catch(err => {
        throw err;
      });
  });

  //API to select book to take
  app.get("/select/book/take", (req, res) => {
    const { username } = req.user;
    Book.find({})
      .then(books => {
        books = books.filter(book => book.ownersname !== username);
        books.map(book => {
          User.find({ username: book.ownersname })
            .then(user => {
              if (user.city) book.city = user.city;
              else book.city = "";
            })
            .catch(err => {
              throw err;
            });
        });
        res.render("books", {
          books: books,
          user: req.user,
          url: req.route.path
        });
      })
      .catch(err => {
        throw err;
      });
  });

  //API to make a request
  app.post("/makeRequest", (req, res) => {
    const { requestersName, offeredBook, requestedBook, ownersName } = req.body;
    const request = new Request({
      requestersName: requestersName,
      offeredBook: offeredBook,
      requestedBook: requestedBook,
      ownersname: ownersName,
      status: "pending"
    });
    request
      .save()
      .then(request => {
        res.redirect("/books");
      })
      .catch(err => {
        throw err;
      });
  });

  const getOfferedRequests = async username => {
    let offeredRequests = await Request.find({ ownersname: username });

    let offeredBookPromises = offeredRequests.map(request => {
      offeredBookPromise = Book.findOne({
        ownersname: request.requestersName,
        title: request.offeredBook
      });
      return offeredBookPromise;
    });
    let requestedBookPromises = offeredRequests.map(request => {
      requestedBookPromise = Book.findOne({
        ownersname: request.ownersname,
        title: request.requestedBook
      });
      return requestedBookPromise;
    });
    let usersPromises = offeredRequests.map(request => {
      User.findOne({ username: request.requestersName });
    });

    const offeredBooks = await Promise.all(offeredBookPromises);
    const requestedBooks = await Promise.all(requestedBookPromises);
    const users = await Promise.all(usersPromises);

    return {
      offeredRequests,
      offeredBooksForRequest: offeredBooks,
      requestedBooksForRequest: requestedBooks,
      users
    };
  };

  const getMyRequests = async username => {
    let requests = await Request.find({ requestersName: username });

    let offeredBookPromises = requests.map(request => {
      offeredBookPromise = Book.findOne({
        ownersname: request.requestersName, //taker
        title: request.offeredBook
      });
      return offeredBookPromise;
    });
    requestedBookPromises = requests.map(request => {
      requestedBookPromise = Book.findOne({
        ownersname: request.ownersname, //giver
        title: request.requestedBook
      });
      return requestedBookPromise;
    });

    const offeredBooks = await Promise.all(offeredBookPromises);
    const requestedBooks = await Promise.all(requestedBookPromises);

    return { requests, offeredBooks, requestedBooks };
  };

  //API to get my requests
  app.get("/createRequests", async (req, res) => {
    const { username } = req.user;
    //const username = "ilshh";
    let { requests, offeredBooks, requestedBooks } = await getMyRequests(
      username
    );
    let i = 0;
    offeredBooks.map(offeredBook => {
      requests[i].offeredBookAuthor = offeredBook.author;
      i++;
    });

    i = 0;
    requestedBooks.map(requestedBook => {
      requests[i].requestedBookAuthor = requestedBook.author;
      i++;
    });

    let {
      offeredRequests,
      offeredBooksForRequest,
      requestedBooksForRequest,
      users
    } = await getOfferedRequests(username);
    console.log(offeredBooksForRequest);
    i = 0;
    offeredBooksForRequest.map(offeredBook => {
      offeredRequests[i].offeredBookAuthor = offeredBook.author;
      i++;
    });

    i = 0;
    requestedBooksForRequest.map(requestedBook => {
      offeredRequests[i].requestedBookAuthor = requestedBook.author;
      i++;
    });
    console.log(users);
    users.map((user, i) => {
      if (user.city) {
        offeredRequests[i].city = user.city;
      } else {
        offeredRequests[i].city = "";
      }
      return user;
    });

    res.render("requests", {
      offeredRequests: offeredRequests,
      user: req.user,
      requests: requests
    });
  });

  //API to delete my request
  app.delete("/delete/request", (req, res) => {
    const { id } = req.body;
    console.log(id);
    Request.findByIdAndDelete(id)
      .then(() => {
        res.redirect("/createRequests");
      })
      .catch(err => {
        throw err;
      });
  });
  //API to accept request
  app.post("/accept/request", (req, res) => {
    const { id } = req.body;
    Request.findByIdAndUpdate(id, { status: "completed" }, { new: true })
      .then(() => {
        res.redirect("/books");
      })
      .catch(err => {
        throw err;
      });
  });
  //API to cancel request
  app.post("/cancel/request", (req, res) => {
    const { id } = req.body;
    Request.findByIdAndUpdate(
      id,
      { $set: { status: "canceled" } },
      { new: true }
    )
      .then(() => {
        res.redirect("/books");
      })
      .catch(err => {
        throw err;
      });
  });
};
