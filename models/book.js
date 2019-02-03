const mongoose = require("mongoose")


const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    ownersname: String
})

const bookModel = new mongoose.model("book", bookSchema)

module.exports = bookModel