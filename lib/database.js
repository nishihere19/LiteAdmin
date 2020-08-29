var mongoose = require('mongoose')
Schema= require('mongoose').Schema


var dbSchema = mongoose.Schema({
	username : String,
	name: String,
	tables:[{type: Schema.Types.ObjectId, ref: 'tables'}],
});


var db = mongoose.model('db', dbSchema);
module.exports = db;