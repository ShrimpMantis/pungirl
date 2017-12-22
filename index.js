'user strict';
const mongoose= require("mongoose");
const db=mongoose.connect(process.env.MONGODB_URI);
const Movie=require("./models/jokes-model");
const reddit = require('reddit-joke');
const pun= require("puns");
var name_sender="";

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
	//console.log("10000");
	var senderId=event.sender.id;
	var receivedMessage=event.message;
	console.log("received Message",receivedMessage);
	if(event.read){
		console.log("message delivered");
	}
	
	if(typeof event.message!== "undefined"){
		if(!event.message.is_echo ){
			var text=event.message.text;
			console.log("text",text);
			var nlpEntities= event.message.nlp.entities;
			console.log("nlpEntities",nlpEntities);
			var benchMarkConfidence=0;
			var entityObject={};
			for(var entity in nlpEntities){
				var confidence=nlpEntities[entity][0].confidence;
				if(benchMarkConfidence<confidence){
					benchMarkConfidence=confidence
					entityObject=nlpEntities[entity];
				}				
			}
			console.log("benchmarkconfidence",benchMarkConfidence);
			var complimentMessage="";
			switch(entityObject[0]._entity)
			{
				case "greetings":
					complimentMessage="thank you";
					break;
				 case "thanks" :
					 complimentMessage="You are welcome.";
					 break;
				 case "bye":
					 complimentMessage="Another one for  you";
					 getJoke(senderId);
					  break;
				case "phone number":
					  complimentMessage="Are you connecting with me?";
					  getJoke(senderId);
				break;
				case "email address":
					  complimentMessage="is that your email? it is funny";
					  getJoke(senderId);
				break;
				case "distance":
				      complimentMessage="Are you connecting with me?";
					  getJoke(senderId);
				break;
				case "duration":
					  complimentMessage="Happy hour pun.";
					  getJoke(senderId);
				break;
				case "quantity":
					 complimentMessage="that is a lot of Pun";
					  getJoke(senderId);
				break;
				default:
					 complimentMessage="You are so charming" +" "+name_sender+" "+"This might hurt your stomach" ;
					 getJoke(senderId);
					 break;
			}
			console.log("name_sender",name_sender);
			console.log("message",complimentMessage);
			sendMessage(senderId,{text:complimentMessage});
			
			//getJoke(senderId);
		}
	}
}

function getJoke(senderId){
	var message="test";
	
	pun.getRandomPun().then(function(pun){
		console.log("joke",pun);
		message=pun;
		sendMessage(senderId,{text:message});
	});	
	
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
				name_sender=bodyObj.first_name;;
                name = bodyObj.first_name;
                greeting = "Hi" + " " + name + ".";
            }

            var message = greeting + " Let me tell you a joke today.";
            sendMessage(senderId, { text: message });

        });
    }
}

function sendMessage(recipientId, message) {
console.log("recipientId",recipientId);
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
        }else{
			console.log("message sent");
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

