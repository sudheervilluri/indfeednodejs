const Twitter = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');
const Facebook = require('facebook-sdk');
const config = require('./config');


async function postToTwitter(content, config) {
  const client = new Twitter(config.twitter);
  const tweet = await client.v2.tweet(content);
  console.log(`Tweet posted: ${tweet.id}`);
}

async function postToTelegram(content) {
  const bot = new TelegramBot(config.telegramBotToken, { polling: false });
  bot.sendMessage(config.telegramChatId, content);
  console.log(`Message posted to Telegram`);
}

async function postToFacebook(content, config) {
  const facebook = new Facebook(config.facebook);
  const post = await facebook.api('/me/feed', 'post', { message: content });
  console.log(`Post posted to Facebook: ${post.id}`);
}

module.exports = {  postToTelegram };