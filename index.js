const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const { Card, Suggestion, WebhookClient } = require('dialogflow-fulfillment')
const ClothingDB = require("./clothing")
const _ = require("underscore")
require("dotenv").config()

const server = express()
const port = process.env.PORT | 3000
process.env.DEBUG = 'dialogflow:debug'

server.use(bodyParser.json())

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})

server.post('/bot', (request, response) => {
    const agent = new WebhookClient({request, response})
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers))
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body))

    let intentMap = new Map()
    intentMap.set('Default Welcome Intent', welcome)
    intentMap.set('Default Fallback Intent', fallback)
    intentMap.set('Start Order', startOrder)
    intentMap.set('Merken', brands)
    intentMap.set('Order Style', orderStyle)
    agent.handleRequest(intentMap)
})

function welcome(agent) {
    agent.add(`Welkom bij de Sports Bot!`)
}

function fallback(agent) {
    agent.add(`Sorry, ik begrijp het niet`)
    agent.add(`I'm sorry, can you try again?`)
}

function startOrder(agent) {
    const clothing = agent.parameters['Clothing'].toLowerCase()
    const itemList = ClothingDB[clothing]
    if(itemList) {
        const styles = _.uniq(itemList.map((item) => item.style)).join(", ").toLowerCase()
        agent.add(`
            We hebben ${clothing} van in de volgende stijlen: ${styles}.\n
            Welke stijl zou je willen hebben?
        `)
        
    } else {
        agent.add(`We verkopen helaas geen ${clothing}`)
    }
    agent.setContext({ name: 'order', lifespan: 5, parameters: { clothing }});
}

function brands(agent) {
    const brands = _.uniq([].concat(
        ClothingDB.shirts, 
        ClothingDB.hoodies, 
        ClothingDB.shorts, 
        ClothingDB.shoenen, 
        ClothingDB.caps
    ).map(item => item.brand)).join(", ")
    agent.add(`Wij verkopen de volgende mekren: ${brands}`)
}

function orderStyle(agent) {
    const style = agent.parameters['Style'].toLowerCase()
    const context = agent.getContext("order")
    const clothing = context.parameters.clothing
    if(clothing) {
        const brands = _.uniq(ClothingDB[clothing]
            .filter(item => item.style.toLowerCase() === style)
            .map(item => item.brand))
            .join(", ")

        agent.add(`Wij verkopen ${style} ${clothing} van de volgende merken: ${brands}`)
        agent.setContext({ name: 'order', lifespan: 5, parameters: { clothing, style }});
    } else {
        agent.add('Wat voor soort kleding zou je willen hebben?')
    }
}

server.listen(port, () => {
    console.log("listening on port " + port)
})