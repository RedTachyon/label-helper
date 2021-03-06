const fs = require('fs');
const express = require('express');
const path = require("path");
const bodyParser = require("express");
const rll = require('read-last-lines');
const opn = require('opn');

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

app.route('/data').get((req, res) => {
    fs.readFile(savePath, (err, data) => {
        if (err) throw err;
        res.send(data);
        res.end();
    });
});

app.route('/data').post((req, res) => {
    //console.log("Received a post request");
    console.log(req.body);

    fs.appendFile(savePath, JSON.stringify(req.body) + '\n', (err) => {
        if (err) throw err;
        fs.readFile(savePath, (err, data) => {
            if (err) throw err;
            res.send(data);
            res.end();
        });
    });
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

app.route('/save').post((req, res) => {
   fs.readFile(savePath, (err, data) => {
       for (let i = 0; i <= 100; i++) {
           if (!fs.existsSync(savePath + "backup" + i)) {
               fs.writeFile(savePath + "backup" + i, data, (err) => {
                   if (err) throw err;
                   console.log("Saved backup to " + savePath + "backup" + i);
               });
               break;
           }
       }
   })
});

const port = 1337;

app.listen(port, () => {
    console.log(`Port ${port} listening...`)
});

opn('http://localhost:1337');
