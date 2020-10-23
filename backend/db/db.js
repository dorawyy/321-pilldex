const mongoose = require('mongoose');
const connOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
//const connStr = "mongodb://localhost:27017/pilldex";
const connStr = "mongodb://0.0.0.0:27017/pilldex";

mongoose.connect(connStr, connOptions);
mongoose.Promise = global.Promise;

const Pill = require('./pillmodel.js');
const User = require('./usermodel.js');
const Schedule = require('./schedulemodel.js');

module.exports = {
	Pill, 
	User,
	Schedule
};
