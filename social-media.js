const Twitter = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');
const Facebook = require('facebook-node-sdk');
const config = require('./config');


async function postToTwitter(content, config) {
  const client = new Twitter(config.twitter);
  const tweet = await client.v2.tweet(content);
  console.log(`Tweet posted: ${tweet.id}`);
}

async function postToTelegram(content) {
  const bot = new TelegramBot(config.telegramBotToken, { polling: false });
  bot.sendMessage(config.telegramChatId, content);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 20-second sleep
  console.log(`Message posted to Telegram`);
}

async function postToFacebook(content) {
    try {
      const facebook = new Facebook(config.facebook);
      facebook.api('/me/feed', 'post', { message: content }, (err, post) => {
        if (err) {
          console.error(`Error posting to Facebook: ${err.message}`);
        } else {
          console.log(`Post posted to Facebook: ${post.id}`);
        }
      });
    } catch (error) {
      console.error(`Error posting to Facebook: ${error.message}`);
    }
  }

module.exports = {  postToTelegram, postToFacebook };