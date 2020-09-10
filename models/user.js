const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    firstName:String,
    lastName:String,
    email:String,
    streetaddress:String,
    city:String,
    state:String,
    zipcode:Number,
    race:String,
    gender:String,
    birthdate:Date
});
mongoose.model('User', UserSchema);