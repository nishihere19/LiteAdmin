var mongoose = require('mongoose')
Schema= require('mongoose').Schema


var UsersSchema = mongoose.Schema({
	username : {type: String, index: true, unique: true},
	password : String,
	database:[{type: Schema.Types.ObjectId, ref: 'db'}],
	lastlogin : {type: Date, default : Date.now}
});


var Users = mongoose.model('Users', UsersSchema);
module.exports = Users;