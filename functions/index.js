const functions = require('firebase-functions');
const express = require('express');
const app = express();
var path = require('path');
var cookieParser = require('cookie-parser');

app.use('/', require('./routes/main'));
app.use('/goorm', require('./routes/goorm'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use('./public/images', express.static('/images'));

const api = functions.https.onRequest(app);
module.exports = {api};


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
