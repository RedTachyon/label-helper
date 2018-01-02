const fs = require('fs');
const express = require('express');
const path = require("path");

let app = express();

app.use(express.static('public'));

app.route('/').get((req, res) => {
    //res.end(path.join(__dirname, 'public', 'views', 'index.html'));
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.route('/data').post((req, res) => {

})

app.listen(1337, () => {
    console.log('Port 1337 listening...')
});