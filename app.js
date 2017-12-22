'user strict';
const mongoose= require("mongoose");
const db=mongoose.connect(process.env.MONGODB_URI);
const Movie=require("./models/jokes-model");
const reddit = require('reddit-joke');

const express = require('express')
path = require('path'),
PORT = process.env.PORT || 5000,
bodyParser = require('body-parser'),
app = express().use(bodyParser.json());




const request = require('request');


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get('/', function (req, res) {
    res.send("Hi I am a chat bot")
});

app.post('/webhook/', (req, res) => {
    console.log("req", req.body);
    if (req.body.object === "page") {
        req.body.entry.forEach(function (entry) {
            entry.messaging.forEach(function (event) {
				console.log("event",event);
				//console.log("is echo",event.message);
				//console.log("nlpqwow",event.message.nlp.entities);
				//console.log("event2",event.message.nlp);
                if (event.postback) {
                    processPostback(event);
                }else{
					processMessage(event);
				}

            });
        });
        res.sendStatus(200)
    }
});

function processMessage(event){
	
	var senderId=event.sender.id;
	var receviedMessage=event.message;
    console.log("text",receviedMessage.text);
	var nlpEntities= event.message;
	//console.log("nlpobj",nlpEntities);
	var joke= getJoke(senderId,);
	var message= "";
	
}

function getJoke(senderId){
	var joke=reddit.joke(3);
	var message="test";
	console.log("joke",typeof (joke));
	//	saveJokeRecord(senderId,message);
		sendMessage(senderId,{text:message});
	
}

function saveJokeRecord(senderId,jokeObject){
	console.log("in save joke record function");
}

function processPostback(event) {
    var senderId = event.sender.id;
    var payLoad = event.postback.payload;
	//console.log("nlpWow",event.message.nlp.entities);
		
    if (payLoad === "Greeting") {

        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: "GET"
        }, function (error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name " + error);
            } else {
				console.log("message build",body);
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi" + " " + name + ".";
            }

            var message = greeting + " Let me tell you a joke today.";
            sendMessage(senderId, { text: message });

        });
    }
}

function sendMessage(recipientId, message) {

    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: {
            recipient: { id: recipientId },
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log("Error", response.error);
        }
    });
}


app.get('/webhook/', (req, res) => {

    let VERIFY_TOKEN = "ShrimpMantis"

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {

        if (mode === "subscribe" && token == VERIFY_TOKEN) {

            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        }
        else {

            res.sendStatus(403);
        }
    }
});

