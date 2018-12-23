var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const Email = require('mongoose-type-mail');


var UserSchema = new Schema({
	name:{type: String, required: true},
	email:{type:Email, required:true, index: {unique: true} },
	password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema)
module.exports = User;
