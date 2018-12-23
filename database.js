var mongoose = require('mongoose');
require('dotenv').config()

const Boom = require('boom');

const dbName = process.env.MONGO_DBNAME,
	dbUser = process.env.MONGO_DB_USER,
	dbPassword = process.env.MONGO_DB_PASSWORD,
	dbHost = process.env.MONGO_DB_HOST,
	dbPort = process.env.MONGO_DB_PORT;

if (!dbName) {
	console.log("Db name is not provide in env file ")
	throw Boom.notFound("DB not found");
}
let mongoUrl = false;
if (dbUser != '' && dbPassword != '' && dbHost != '' && dbPort != '') {
	mongoUrl = "mongodb://" + dbUser + ":" + encodeURIComponent(dbPassword) + "@" + dbHost + ":" + dbPort + "/" + dbName;
} else {
	mongoUrl = 'mongodb://localhost/' + dbName;
}

mongoose.connect(mongoUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
	console.log('Connection with database succeeded.');
});
exports.db = db;
// exports.test = function(req,res) {
//   res.render('test');
// };