const mongoose = require("mongoose")


const requestSchema = new mongoose.Schema({
    requestersName: String,
    offeredBook: String,
    requestedBook: String,
    ownersname: String,
    status: String
})

const requestModel = new mongoose.model("request", requestSchema)

module.exports = requestModel