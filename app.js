const config = require('./config');
const rssParser = require('./rss-parser');
const openAiApi = require('./openai-api');
//const telegramApi = require('./telegram-api');
//const twitterApi = require('./twitter-api');
const socialMedia = require('./social-media');
const fs = require('fs');
const cron = require('node-cron');


// Load the existing data from the file
let existingData = [];
try {
    existingData = fs.readFileSync('data.json', 'utf8');
    existingData = JSON.parse(existingData) || [];
} catch (error) {
    console.error(error);
}

// Set the RSS feed URL and interval
const rssUrl = config.rssUrl;
const interval = config.interval;

// Read the RSS feed at the specified interval
setInterval(() => {
    rssUrl.forEach(it => {
        rssParser.parseRssFeed(it)
            .then(feed => {
                // Filter out items with an isoDate older than today
                const today = new Date().getDate();
                
                const filteredItems = feed.items.filter(item => {
                    const isoDate = new Date(item.isoDate).getDate();
                    return isoDate >= today;
                });

                // Process the filtered items
                filteredItems.forEach(item => {
                    // Check if the item is new
                    const isNew = !existingData.find(existingItem => existingItem.link === item.link);
                    if (isNew) {
                        // Send the item to OpenAI for rewriting
                        console.log(item);
                        openAiApi.generateContent(item)
                            .then(rewrittenText => {
                                // Post the rewritten text on Facebook
                                  socialMedia.postToTelegram(rewrittenText);
                              //  socialMedia.postToFacebook(rewrittenText);
                                // Add the item to the existing data
                                existingData.push(item);
                                fs.writeFileSync('data.json', JSON.stringify(existingData));
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    }
                });
            })
            .catch(error => {
                console.error(error);
            });
    });
}, interval);

// Run every midnight to reset the data.json file
cron.schedule('0 0 * * *', () => {
    console.log('Resetting data.json file...');
    fs.writeFileSync('data.json', JSON.stringify([]));
});