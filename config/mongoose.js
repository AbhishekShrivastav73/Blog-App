const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/referencing');

const db = mongoose.connection;

db.on('error',(err)=> console.error('connection error: ' + err));
db.on('open',()=> console.log('open connection'));