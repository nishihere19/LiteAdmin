var mongoose = require('mongoose')
Schema= require('mongoose').Schema


var tableSchema = mongoose.Schema({
    username : String,
    name: String,
    col: {type: Number, min:1},
	columns:[{type: Schema.Types.ObjectId, ref: 'column'}],
    rows: Number,
    dbname: String
});


var tables = mongoose.model('table', tableSchema);
module.exports = tables;