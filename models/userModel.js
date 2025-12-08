const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:String,
    email:{type:String},
    password:{type:String},
    role:{type:String,enum:["user","admin"],default:"user"},
    profileId:Number 
})

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;