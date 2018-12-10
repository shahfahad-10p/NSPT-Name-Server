var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var fs = require('fs');

router.post('/upload', function (req, res, next) {
    console.log("INCOMING REQUEST FROM CLIENT");
    req.store.push(req.body.fileName);
    request.post({ url: 'http://localhost:3000/file/upload', json: req.body },
        function (err, httpResponse, body) {
            if (err) {
                return res.status(404).send(err);
            }
            console.log("OUTGOING RESPONSE TO CLIENT");
            return res.send(body);
        });
});

module.exports = router;