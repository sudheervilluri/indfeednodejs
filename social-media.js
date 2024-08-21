const Twitter = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');
const Facebook = require('facebook-node-sdk');
const config = require('./config');


async function postToTwitter(content, config) {
  const client = new Twitter(config.twitter);
  const tweet = await client.v2.tweet(content);
  console.log(`Tweet posted: ${tweet.id}`);
}

const queue = [];

async function postToTelegram(content) {
  console.log("message send to pool"+content)
  queue.push(content);
  processQueue();
}
 

async function processQueue() {
  if (queue.length === 0) return;

  const content = queue[0];
  try {
    const bot = new TelegramBot(config.telegramBotToken, { polling: false });
    await bot.sendMessage(config.telegramChatId, content);
    console.log(`Message posted to Telegram`);
    queue.shift(); // Remove the message from the queue if successful
  } catch (error) {
    console.error(`Error sending message to Telegram: ${error}`);
    // Do not remove the message from the queue if there's an error
  }

  await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay

  processQueue();
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