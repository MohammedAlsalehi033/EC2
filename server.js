const express = require('express');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

let users = {}; 

wss.on('connection', (ws) => {
    const userID = uuidv4();
    users[userID] = ws;
    ws.send(JSON.stringify({ type: 'WELCOME', userID }));

    ws.on('message', (message) => {
        try {
            const { type, recipientID, text } = JSON.parse(message);
            if (type === 'CHAT' && users[recipientID]) {
                users[recipientID].send(JSON.stringify({ senderID: userID, text }));
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        delete users[userID];
        console.log(`User ${userID} disconnected`);
    });
});
