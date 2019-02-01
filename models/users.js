const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    city: String,
    address: String
})
const userModel = new mongoose.model("user", userSchema);
module.exports = userModel