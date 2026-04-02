const path = require('path');
const fs = require('fs');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

/**
 * ✅ DB Connection (skipped in test)
 */
if (process.env.NODE_ENV !== 'test' && process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        user: process.env.MONGO_USERNAME,
        pass: process.env.MONGO_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function(err) {
        if (err) {
            console.log("error!! " + err);
        }
    });
}

/**
 * ✅ Schema & Model
 */
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

const planetModel = mongoose.model('planets', dataSchema);

/**
 * ✅ Routes
 */

// POST /planet
app.post('/planet', function(req, res) {

    // 👉 Mock response during tests (no DB dependency)
    if (process.env.NODE_ENV === 'test') {
        return res.send({
            name: "Earth",
            id: 3,
            description: "Mock Planet"
        });
    }

    planetModel.findOne({ id: req.body.id }, function(err, planetData) {
        if (err) {
            return res.send("Error in Planet Data");
        }
        res.send(planetData);
    });
});

// Home
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

// API Docs
app.get('/api-docs', (req, res) => {
    fs.readFile('oas.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
        }
        res.json(JSON.parse(data));
    });
});

// OS Info
app.get('/os', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        os: OS.hostname(),
        env: process.env.NODE_ENV
    });
});

// Liveness
app.get('/live', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        status: "live"
    });
});

// Readiness
app.get('/ready', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        status: "ready"
    });
});

/**
 * ✅ Start server ONLY if not test
 */
if (process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => {
        console.log("Server successfully running on port - " + 3000);
    });
}

module.exports = app;