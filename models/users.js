const mongoose = require("mongoose")
const findOrCreate = require("mongoose-findorcreate")
const userSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    city: String,
    address: String
})

userSchema.plugin(findOrCreate)

const userModel = new mongoose.model("user", userSchema);
module.exports = userModel