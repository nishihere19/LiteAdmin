var mongoose = require('mongoose')
Schema= require('mongoose').Schema


var columnSchema = mongoose.Schema({
	username : String,
    tablename: String,
    name: String,
    length: Number,
    unique: Boolean,
    rows:[],
    dbname:String,
    foreignId: [{type: Schema.Types.ObjectId, ref: 'column'}],
});


var column = mongoose.model('column', columnSchema);
module.exports = column;