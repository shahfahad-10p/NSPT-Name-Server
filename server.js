const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config/config.js');
const fs = require('fs');
const fileRoutes = require('./routes/file');
const registerRoutes = require('./routes/register');

const fileName = config.path;

var store = [];
var servers = [];

app.use((req, res, next) => {
    req.store = store;
    req.servers = servers;
    next();
});

app.use(bodyParser.json({ limit: "15MB", type: 'application/json' }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/file', fileRoutes);
app.use('', registerRoutes);

app.get('/', (req, res) => {
    res.send('NAME SERVER');
});

app.listen(3000);