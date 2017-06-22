'use strict' // must use var or let when we create a variable

//dependencies
const express = require('express') //handles framework for writing javascript for backend
const bodyParser = require('body-parser') // used to parse request data
const request = require('request') //allow us to send messages

const app = express() // starting express

app.set('port', (process.env.PORT || 8080)) //uses either an environment port or localhost port 8080

//process data and return it as a json
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//ROUTES
app.get('/', function (req, res) {
    res.send("Hi, I am a chatbot") // displays message if everything works
})

let token = "EAAWlhJUCHlwBAFngFIy2WUPsizN24DbPlHMBkXMpmCiEsLGTqxmhsLEQXZCZA3g3QTj5vZCZCnBayZB" +
        "84ZCxh6hYVH0FrbGI6YZCAkkc1p3YMyhoXglungRsMKuCE1bdNrRYZChzT4g3ZBrvln3x8ppBRnU5ZAZ" +
        "CKcgnk5airxKAfc3AAZDZD" //FB app token

// Facebook - security Facebook is going to the webhook and check the requesting
// token to see if it matches the "Passw0rd123"
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === "Passw0rd123") {
        res.send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

// need to run this in curl command in terminal so that the terminal remembers
// your token curl -X POST
// "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=<PAGE_ACCESS
// _ TOKEN>" application gives back to facebook
app.post('/webhook/', function (req, res) {
    //if you send a lot of message in a row this will list all the messages
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        //if there is a message and that message has text then return text
        if (event.message && event.message.text) {
            let text = event.message.text
            decideMessage(sender, text)
            //sendText(sender, "Text echo: " + text.substring(0, 100))
        }
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            decideMessage(sender, text)
            continue
        }
    }
    //status 200 = OK
    res.sendStatus(200)
})

function decideMessage(sender, text1) {
    let text = text1.toLowerCase()
    if (text.includes('superman')) {
        sendSupermanMessage(sender)
    } else if (text.includes("hilo")) {
        sendHiloMessage(sender)
    } else {
        sendText(sender, "Search For Superman or Hilo")
        sendButtonMessage(sender, "Who is your favorite character Superman or Hilo?")
    }
}

function sendText(sender, text) {
    let messageData = {
        text: text
    }
    sendRequest(sender, messageData)

}

function sendButtonMessage(sender, text) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": text,
                "buttons": [
                    {
                        "type": "postback",
                        "title": "Superman",
                        "payload": "superman"
                    }, {
                        "type": "postback",
                        "title": "Hilo",
                        "payload": "hilo"
                    }
                ]
            }
        }
    }
    sendRequest(sender, messageData)
}

function sendSupermanMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Superman!",
                        "image_url": "https://upload.wikimedia.org/wikipedia/en/e/eb/SupermanRoss.png",
                        "subtitle": "Superman Superman! ",
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://en.wikipedia.org/wiki/Superman",
                                "title": "Superman Wiki"
                            }

                        ]
                    }

                ]
            }
        }

    }

    sendRequest(sender, messageData)

}

function sendHiloMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Hilo!",
                        "image_url": "http://images.penguinrandomhouse.com/cover/9780385386203",
                        "subtitle": "Hilo Hilo! ",
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "http://characters.wikia.com/wiki/Hilo_(character)",
                                "title": "Hilo Wikia"
                            }

                        ]
                    }

                ]
            }
        }

    }

    sendRequest(sender, messageData)

}

function sendRequest(sender, messageData) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {
            access_token: token
        },
        method: "POST",
        json: {
            recipient: {
                id: sender
            },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log("sending error")
        } else if (response.body.error) {
            console.log("response body error")
        }
    })
}

app
    .listen(app.get('port'), function () {
        console.log("running: port")
    })