let express = require('express');
let path = require('path');
let fs = require('fs');
const { MongoClient } = require('mongodb');
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CONFIGURATION
const databaseName = "my-db";
// use when starting application locally
//const mongoUrlLocal = "mongodb://admin:password@localhost:27017";
// use when starting application as docker container
const mongoUrlDocker = "mongodb://admin:password@mongodb";

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', (req, res) => {
    let img = fs.readFileSync(path.join(__dirname, "images/profile-avatar.png"));
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(img, 'binary');
});

// GET PROFILE
app.get('/get-profile', async (req, res) => {
    const client = new MongoClient(mongoUrlDocker);

    try {
        await client.connect();
        const db = client.db(databaseName);
        const myquery = { userid: 1 };

        const result = await db.collection("users").findOne(myquery);

        res.send(result || {});
    } catch (err) {
        res.status(500).send({ error: "Failed to fetch profile" });
    } finally {
        await client.close(); // Always close connection, even on error
    }
});

// UPDATE PROFILE
app.post('/update-profile', async (req, res) => {
    const userObj = req.body;
    const client = new MongoClient(mongoUrlDocker);

    try {
        await client.connect();
        const db = client.db(databaseName);

        userObj['userid'] = 1;
        const myquery = { userid: 1 };
        const newvalues = { $set: userObj };

        await db.collection("users").updateOne(myquery, newvalues, { upsert: true });

        res.send(userObj);
    } catch (err) {
        res.status(500).send({ error: "Failed to update profile" });
    } finally {
        await client.close();
    }
});

app.listen(3000, () => {
    console.log("App listening on port 3000 !");
});
