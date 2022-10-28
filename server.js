// importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher'

// app configuration
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
    appId: "1498710",
    key: "3b3e15cecd6f8fd438ff",
    secret: "e4b55036cda812e20140",
    cluster: "us2",
    useTLS: true
});

// middleware
app.use(express.json());

app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allowe-Headers", "*");
    next();
});

// database configuration
const connection_url = "mongodb+srv://wkoonz:HH1XBIR8HeFusaGB@cluster0.ayafc3m.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(connection_url)

const db = mongoose.connection

db.once('open', () => {
    console.log('DB connected');

    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
        console.log(change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDetails.name,
                    message: messageDetails.message
                }
            );
        } else {
            console.log('Error triggering Pusher')
        }
    });
});

// ???

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'))

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

// listener
app.listen(port, () => console.log(`Listening on localhost:${port}`))

// HH1XBIR8HeFusaGB