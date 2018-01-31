# Krypto Kwote

Check the price of Bitcoin, Ethereum, and Litecoin using an Amazon Alexa Skill

## Step 1 - Designing the skill

https://developer.amazon.com/designing-for-voice/

Our objectives for the skill:
1. Ask for the current exchange rate for the selected coin and USD
2. Ask how much of the selected coin you can purchase for a given USD amount

Examples of use:
- "Alexa, ask Crypto Quote how much is Bitcoin"
- "Alexa, ask Crypto Quote how much Ethereum I can buy for $500"

Skills are designed around skill invocation. The basic flow is as follows:

1. The user says the command: "Alexa, ask Crypto Quote for the price of Bitcoin"
2. The Alexa-enabled device sends the voice command to Alexa in the cloud
3. Alexa parses the command into JSON
4. Alexa then triggers the configured webhook or Lambda function with the request parameters
5. The function/webhook responds to the request from Alexa
6. Alexa prepares the response and sends it back to the Alexa device
7. The Alexa enabled device answers the user with the reply it received from Alexa

### Alexa Skill Invocation

- Wake Word - Used to get the attention of the device. For Alexa, sample wake words are "Alexa", "Echo", "Amazon"
- Launch Phrase - Directs Alexa to trigger a skill. Examples: "ask", "launch", "start"
- Invocation Name - The name of the skill you want to trigger
- Utterances - Tell Alexa what the skill should do. Alexa allows you to add dynamic parts to the utterance, called "slots"

When the user invokes the skill, Alexa parses it into JSON and passes the data to the handler (Lambda/webhook)

```
|    Alexa    |      ask       |    Crypto  Quote    |    for    the    price    of    |    Bitcoin    |
--------------------------------------------------------------------------------------------------------
|  Wake Word  | Launch Phrase  |   Invocation Name   |            Utterance            |   Slot Value  |
```

## Step 2 - Implementing the Skill

- Go to https://developer.amazon.com/alexa-skills-kit and select "Start a Skill"
- Enter "Krypto Kwote" for the Name
- Enter "Crypto Quote" for the Invocation Name
- Ensure that "Custom Interaction Model" is selected
- Save to proceed to the interaction model

### Interaction Model

The Interaction Model defines the rules by which the user interacts with the skill. To do so, you need to define
"Intent Schema", which is a list of intents that your Alexa skills will be parsed into. You will also need to define
the sample utterances, or phrases that correspond to the intents.

This skill will have two intents: `GetPrice` and `GetAmount`. Both of the intents will use a slot for the currency
requested. That will be named `Coin`. We will define a type for the slot, called `COIN_TYPE`. `GetAmount` will also
require a slot for the amount in USD. This slot is named `Amount` and uses the built-in type `AMAZON.NUMBER`. See
https://developer.amazon.com/docs/custom-skills/slot-type-reference.html for slot type docs.

```
{
  "intents": [
    {
      "intent": "GetPrice",
      "slots": [
        {
          "name": "Coin",
          "type": "COIN_TYPE"
        }
      ]
    },
    {
      "intent": "GetAmount",
      "slots": [
        {
          "name": "Coin",
          "type": "COIN_TYPE"
        },
        {
          "name": "Amount",
          "type": "AMAZON.NUMBER"
        }
      ]
    }
  ]
}
```

Next, you'll need to enter the custom slot type `COIN_TYPE` and the available values (newline separated)
```
Bitcoin
Ethereum
Litecoin
```

Next, you'll need to enter the sample utterances. The following should suffice as a minimum:

```
GetPrice How much is {Coin}
GetPrice What is the price for {Coin}
GetPrice Current {Coin} value
GetPrice {Coin} value

GetAmount How many {Coin} can I get for {Amount} dollars
GetAmount How much {Coin} can I get for {Amount} dollars
GetAmount Amount of {Coin} for {Amount} dollars
GetAmount Number of {Coin} for {Amount} dollars
```

Press "Save" then "Next" to proceed. The next section is for configuring your Lambda or webhook.
Stop here, leave this tab open and code the app.

## Step 3 - Coding the Lambda Function

- Create a new folder and initialize a new NPM project
    - `mkdir krypto-kwote-skill && cd $_ && npm init`
- Create a new file `skill.js`
    - IMPORTANT - Deploying a Lambda skill means you export your module using `exports.handler` instead of `module.exports`
```
'use strict'

function kryptoKwote(event, context, callback) {
    // do something
}

exports.handler = kryptoKwote;
```

We'll be using the following libraries:
- alexa-skill-kit - Simplifies building Alexa skills
- alexa-message-builder - Simplifies building Alexa responses
- cryptocompare - API for http://cryptocompare.com
- node-fetch - http client
- `npm i --S alexa-skill-kit alexa-message-builder cryptocompare node-fetch`
- See code for full, uh, code

## Step 4 - Deploying the Skill

Using `Claudia.js` to deploy the skill (https://claudiajs.com/).

- Install claudia.js as a global node package
    - `npm i -g claudia`
- Create an AWS profile with proper access (IAM full access, Lambda full access, API Gateway Administrator)
    - Store the credentials in ~/.aws/credentials
    - Set the `AWS_PROFILE` environment variable to `claudia`
    - For more detailed claudia config: https://claudiajs.com/tutorials/installing.html
- Run the `claudia create` command with the proper args to deploy
```
claudia create \
    --region us-east-1 \
    --handler skill.handler \
    --version skill
```
- Run the `claudia allow-alexa-skill-trigger` command
    - `claudia allow-alexa-skill-trigger --version skill`
- This returns info like:
```
{
  "Sid": "Alexa-1234567890123",
  "Effect": "Allow",
  "Principal": {
    "Service": "alexa-appkit.amazon.com"
  },
  "Action": "lambda:InvokeFunction",
  "Resource": "arn:aws:lambda:us-east-1:123456789012:function:crypto-skill-medium:skill"
}
```
- The most important piece is the `Resource` which has the ARN for the lambda

## Step 5 - Connecting and Testing Your Skill

- Go back to the "Configuration" page we left off with on Step 3
- Select "AWS Lambda ARN (Amazon Resource Name)" for the Service Endpoint Type and enter the ARN from above
- Save and proceed to "Test"
- Enter a sample utterance. You'll see the parsed request and response
```
# Service Request
{
  "session": {
    "new": true,
    "sessionId": "SessionId.9696422d-7d83-4165-859a-1a2b1f2083ce",
    "application": {
      "applicationId": "amzn1.ask.skill.007fb20d-0e21-489b-8851-5225456bb26e"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AE3VGYEFGVTO74VFAA63HG4ESON26KJLWGHQ425HR7GCRDKM7IBDPC6LSDUA23HR7PWNMBMCZTC5U3CLJFL3RM5YJKJYNZ52Z3CT7SR2SEN32L5PN3OTIH4MBBGZ6Z32EC3FIZE74SGYTTA5VT7NCIHYWUGN6BSPXSJUFYR2QGGI7SEK4LHLWWODJAREJURNC7L3BLXTWJHIV6Q"
    }
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.44e93ef5-2a07-474e-8116-e1e2b75f0d2c",
    "intent": {
      "name": "GetPrice",
      "slots": {
        "Coin": {
          "name": "Coin",
          "value": "ethereum"
        }
      }
    },
    "locale": "en-US",
    "timestamp": "2018-01-31T04:40:00Z"
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "application": {
        "applicationId": "amzn1.ask.skill.007fb20d-0e21-489b-8851-5225456bb26e"
      },
      "user": {
        "userId": "amzn1.ask.account.AE3VGYEFGVTO74VFAA63HG4ESON26KJLWGHQ425HR7GCRDKM7IBDPC6LSDUA23HR7PWNMBMCZTC5U3CLJFL3RM5YJKJYNZ52Z3CT7SR2SEN32L5PN3OTIH4MBBGZ6Z32EC3FIZE74SGYTTA5VT7NCIHYWUGN6BSPXSJUFYR2QGGI7SEK4LHLWWODJAREJURNC7L3BLXTWJHIV6Q"
      },
      "device": {
        "supportedInterfaces": {}
      }
    }
  },
  "version": "1.0"
}

# Service Response
{
  "version": "1.0",
  "response": {
    "outputSpeech": {
      "text": "ethereum is currently 1049.86 dollars",
      "type": "PlainText"
    },
    "speechletResponse": {
      "outputSpeech": {
        "text": "ethereum is currently 1049.86 dollars"
      },
      "shouldEndSession": true
    }
  },
  "sessionAttributes": {}
}
```

- Continue filling out the form and submit for certification if you want
- Click the "Beta Test" button and add some testers if you want
- Try it out!
