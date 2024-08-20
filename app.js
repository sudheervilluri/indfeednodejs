const config = require('./config');
const rssParser = require('./rss-parser');
const openAiApi = require('./openai-api');
//const telegramApi = require('./telegram-api');
//const twitterApi = require('./twitter-api');
const socialMedia = require('./social-media');
const fs = require('fs');
const cron = require('node-cron');
const axios = require('axios');
//https://apixt-iw.indmoney.com/wright/api/web/v1/markets/news?section=stocks_to_watch 
const url = 'https://apixt-iw.indmoney.com/wright/api/web/v1/markets/today?only_news=true';
const params = {
    only_news: true
};

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
};


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
    axios.get(url, { params, headers })
        .then(response => {
            const newData = response.data.data.live_news.list;
        
            // Process the filtered items
            newData.forEach(item => {
                // Check if the item is new
                const isNew = !existingData.find(existingItem => existingItem.link === item.link);
                if (isNew) {
                    var text = ""
                    if (item.title) {
                        text = `${item.title} and ${item.content}`;
                    } else {
                        text = `${item.heading} and ${item.stock_name}`
                    }
                    // Send the item to OpenAI for rewriting
                    console.log(item);
                    openAiApi.generateContent(text)
                        .then(rewrittenText => {
                            // Post the rewritten text on Facebook
                            socialMedia.postToTelegram(rewrittenText)
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
}, interval);



// Load the existing data from the file
let rssdata = [];
try {
    rssdata = fs.readFileSync('data2.json', 'utf8');
    rssdata = JSON.parse(rssdata) || [];
} catch (error) {
    console.error(error);
}

// Read the RSS feed at the specified interval
setInterval(() => {
    rssUrl.forEach(it => {
        rssParser.parseRssFeed(it)
            .then(feed => {
                // Filter out items with an isoDate older than today
                const today = new Date().getDate();

                let filteredItems = feed.items.filter(item => {
                    const isoDate = new Date(item.isoDate).getDate();
                    return isoDate >= today;
                });

                // Process the filtered items
                filteredItems.forEach(item => {
                    // Check if the item is new
                    const isNew = !rssdata.find(existingItem => existingItem.link === item.link);
                    if (isNew) {
                        var text = ""
                        if (item.title) {
                            text = `${item.title} and ${item.content}`;
                        } else {
                            text = `${item.heading} and ${item.stock_name}`
                        }
                        // Send the item to OpenAI for rewriting
                        console.log(item);
                        openAiApi.generateContent(text)
                            .then(rewrittenText => {
                                // Post the rewritten text on Facebook
                                socialMedia.postToTelegram(rewrittenText)
                                //  socialMedia.postToFacebook(rewrittenText);
                                // Add the item to the existing data
                                rssdata.push(item);
                                fs.writeFileSync('data2.json', JSON.stringify(rssdata));
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
}, rssinterval);

// Run every midnight to reset the data.json file
cron.schedule('0 0 * * *', () => {
    console.log('Resetting data.json file...');
    existingData = []
    rssdata = []
    fs.writeFileSync('data2.json', JSON.stringify([]));
    fs.writeFileSync('data.json', JSON.stringify([]));
});