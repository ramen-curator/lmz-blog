const userArgs = process.argv.slice(2);
const mongoose      = require('mongoose');
const mongoDB       = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise    = global.Promise;
const db            = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));
const async         = require('async');
const Author        = require('./models/author');
const Article        = require('./models/article');



db.close();