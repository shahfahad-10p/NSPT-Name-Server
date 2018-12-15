var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var rp = require('request-promise');
var fs = require('fs');
var _ = require('lodash');

router.post('/upload', function (req, res, next) {

    let availableServer = req.servers.length;//5
    console.log("AVAILABLE SERVERS : ", availableServer);
    let toRequest = parseInt(availableServer / 2) + 1;
    console.log("SERVERS TO REQUEST : ", toRequest);
    let randomNumber = _.random(0, availableServer);
    console.log("RANDOM NUMBER : ", randomNumber);

    let sentToServersAddresses = [];
    let requestSent = 0;

    for (i = 0; i < toRequest; i++) {
        console.log("SENDING TO INDEX : ", randomNumber % availableServer);
        let toRequestIndex = randomNumber % availableServer;

        let toRequestServer = {
            name: req.servers[toRequestIndex].name,
            address: req.servers[toRequestIndex].address,
            version: 1
        }

        sentToServersAddresses.push(toRequestServer);
        request.post({ url: `${req.servers[toRequestIndex].address}/file/upload`, json: req.body },
            function (err, httpResponse, body) {
                if (err) {
                    return console.log("ERROR UPLOADING FROM FILE SERVER", err);
                    // return res.status(404).send(err);
                }
                requestSent++;
                console.log("OUTGOING RESPONSE TO CLIENT", requestSent, toRequest);
                if (requestSent === toRequest) {
                    let fileAdded = {
                        name: req.body.fileName,
                        availableAt: sentToServersAddresses,
                        version: 1
                    }
                    req.store.push(fileAdded);
                    console.log("UPDATED STORE : ", JSON.stringify(req.store, null, 2));
                    return res.send(body);
                }
                // return res.send(body);
            });

        randomNumber++;
    }

});


router.post('/update', function (req, res, next) {

    fileIndex = _.findIndex(req.store, { 'name': req.body.fileName })
    fileToUpdate = req.store[fileIndex];
    let toRequest = fileToUpdate.availableAt.length;
    let requestSent = 0;

    fileToUpdate.availableAt.forEach(fileServer => {
        console.log("UPDATE FILE AT ", fileServer.address);

        request.post({ url: `${fileServer.address}/file/upload`, json: req.body },
            function (err, httpResponse, body) {
                if (err) {
                    return console.log("ERROR UPLOADING FROM FILE SERVER", err);
                }

                fileServer.version++;
                requestSent++;
                console.log("OUTGOING RESPONSE TO CLIENT", requestSent, toRequest);
                if (requestSent === toRequest) {
                    console.log("UPDATED STORE : ", JSON.stringify(req.store, null, 2));
                    return res.send(body);
                }
            });
    })

});


router.post('/download', function (req, res, next) {
    console.log("INCOMING DOWNLOAD REQUEST FROM CLIENT FOR : ", req.body.fileName);

    let fileIndex = _.findIndex(req.store, { 'name': req.body.fileName })
    console.log('DOWNLOAD FILE INDEX : ', fileIndex);
    let fileToDownload = req.store[fileIndex];
    console.log('FILE TO DOWNLOAD : ', fileToDownload);
    let fileAvailableAt = _.map(fileToDownload.availableAt, 'name');

    console.log("FILE AVAILABLE AT : ", fileAvailableAt, );
    let toRequestFromAvailableServer = {};
    let toRequestFromServer = fileAvailableAt.forEach(serverWithFile => {
        req.servers.forEach(availableServer => {
            console.log('MATCHING :', availableServer.name, serverWithFile);
            if (availableServer.name === serverWithFile) {
                toRequestFromAvailableServer = availableServer;
                return;
            }
        })
    })

    console.log("FINALLY FETCHING FROM : ", toRequestFromAvailableServer.name);

    let payload = { fileName: req.body.fileName };
    request.post({ url: `${toRequestFromAvailableServer.address}/file/download`, json: payload },
        function (err, httpResponse, body) {
            if (err) {
                return res.status(404).send(err);
            }
            console.log("OUTGOING RESPONSE TO CLIENT");
            return res.send(body);
        });
});


router.post('/download/text', function (req, res, next) {
    console.log("INCOMING TEXT DOWNLOAD REQUEST FROM CLIENT FOR : ", req.body.fileName);

    let fileIndex = _.findIndex(req.store, { 'name': req.body.fileName })
    console.log('DOWNLOAD FILE INDEX : ', fileIndex);
    let fileToDownload = req.store[fileIndex];
    console.log('FILE TO DOWNLOAD : ', fileToDownload);
    let fileAvailableAt = _.map(fileToDownload.availableAt, 'name');

    console.log("FILE AVAILABLE AT : ", fileAvailableAt, );
    let toRequestFromAvailableServer = {};
    let toRequestFromServer = fileAvailableAt.forEach(serverWithFile => {
        req.servers.forEach(availableServer => {
            console.log('MATCHING :', availableServer.name, serverWithFile);
            if (availableServer.name === serverWithFile) {
                toRequestFromAvailableServer = availableServer;
                return;
            }
        })
    })

    let payload = { fileName: req.body.fileName };
    request.post({ url: `${toRequestFromAvailableServer.address}/file/download/text`, json: payload },
        function (err, httpResponse, body) {
            if (err) {
                return res.status(404).send(err);
            }
            console.log("OUTGOING RESPONSE TO CLIENT");
            return res.send(body);
        });
});

router.get('/list', function (req, res, next) {
    let response = {
        list: _.map(req.store, 'name')
    };

    res.send(response);
});

module.exports = router;