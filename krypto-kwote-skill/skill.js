'use strict';

const alexaSkillKit = require('alexa-skill-kit');
const MessageTemplate = require('alexa-message-builder');
const fetch = global.fetch = require('node-fetch');
const cryptoCompare = require('cryptocompare');

const tokens = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  ether: 'ETH',
  litecoin: 'LTC',
  lightcoin: 'LTC'
};

const sampleCommands = `
  You can say:
  How much is Bitcoin?
  Or How much Litecoin can I get for 100 dollars?
`;

const skillText = `
  Hello from crypto quote.
  I can give you the info about Bitcoin, Ethereum, and Litecoin sprices.
  What can I do for you?
  ${sampleCommands}
`;

const errorText = `
  Bitcoin, Ethereum, and Lightcoin are the only supported cryptocurrencies at this time.
`;

const phrasing = [
  'At the moment',
  'Currently',
  'Right now'
];

function kryptoKwote (event, context) {
  console.log(event);

  alexaSkillKit(event, context, (message) => {
    console.log(message);
    if (message.type === 'LaunchRequest') {
      return new MessageTemplate()
        .addText(skillText)
        .addRepromptText(sampleCommands)
        .keepSession()
        .get();
    } else {
      const token = ((((message || {}).intent || {}).slots || {}).Coin || {}).value || '';
      if (Object.keys(tokens).indexOf(token.toLowerCase()) < 0) {
        return errorText;
      }
      if (message.intent.name === 'GetPrice') {
        // Get the price for selected crypto currency
        return cryptoCompare
          .price(tokens[token], 'USD')
          .then(prices =>
            `${phrasing[Math.floor(Math.random() * phrasing.length)]}, ${token} is ${prices.USD} dollars`);
      }
      if (message.intent.name === 'GetAmount') {
        const amount = Number(((((message || {}).intent || {}).slots || {}).Amount || {}).value || 1);
        // Get an amount of crypto currency that user can get for specified amount of USD
        return cryptoCompare
          .price(tokens[token], 'USD')
          .then(prices => `You can buy ${amount / prices.USD} ${token} for ${amount} dollars`);
      }
    }
  });
}

exports.handler = kryptoKwote;