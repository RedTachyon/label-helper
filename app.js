const fs = require('fs');
const express = require('express');
const path = require("path");
const bodyParser = require("express");
const rll = require('read-last-lines');

let savePath = 'out/points.txt';

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
    //console.log("Received a post request");
    console.log(req.body);

    // let today = new Date();
    // let dd = today.getDate();
    // let mm = today.getMonth() + 1;

    //console.log(path);
    //fs.writeFileSync(path, JSON.stringify(req.body));

    fs.appendFile(savePath, JSON.stringify(req.body) + '\n', (err) => {if (err) throw err});
    res.send('Here we go');
    res.end();
});

app.route('/undo').post((req, res) => {
    rll.read(savePath, 1).then((lines) => {
        let toRemove = lines.length;
        fs.stat(savePath, (err, stats) => {
           if (err) throw err;
           fs.truncate(savePath, stats.size - toRemove, (err) => {
               if (err) throw err;
               console.log("Popped last line");
               //res.send("Boom indeed");
               fs.readFile(savePath, (err, data) => {
                   if (err) throw err;
                   res.send(data);
                   res.end();
               })
           })
        });

    });
});

app.route('/data').get((req, res) => {
    res.end("This isn't the request you're looking for.")
});

const port = 1337;
app.listen(port, () => {
    console.log(`Port ${port} listening...`)
});

/*
* TO DO:
*   undo
*   more user-friendly controls
*   display the points marked
*
 */