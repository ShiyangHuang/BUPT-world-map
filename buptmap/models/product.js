// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var productSchema = new mongoose.Schema({
	userid: Number,
    username: String,
    email: String,
    userprofile: String,
    lat: Number,
    lng: Number
});

// Return model
module.exports = restful.model('Products', productSchema);