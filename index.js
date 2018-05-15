const express = require('express')
const { Card, Suggestion, WebhookClient } = require('dialogflow-fulfillment')
require("dotenv").config()

const server = express()
const port = process.env.PORT | 3000
process.env.DEBUG = 'dialogflow:debug'

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})

server.post('/bot', (req, res) => {
    const agent = new WebhookClient({req, res})
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers))
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body))

    let intentMap = new Map()
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap)
})

function welcome(agent) {
    agent.add(`Welcome to my agent!`);
}

function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

server.listen(port, () => {
    console.log("listening on port " + port)
})