const fs = require('fs');
const express = require('express');
const path = require("path");
const bodyParser = require("express");

let app = express();

app.use(express.static('public'));

app.route('/').get((req, res) => {
    //res.end(path.join(__dirname, 'public', 'views', 'index.html'));
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(bodyParser.json());
app.route('/data').post((req, res) => {
    console.log("Received a post request");
    console.log(req.body);
    res.end('Here we go');
});

app.route('/data').get((req, res) => {
    res.end("This isn't the request you're looking for.")
});

const port = 1337;
app.listen(port, () => {
    console.log(`Port ${port} listening...`)
});