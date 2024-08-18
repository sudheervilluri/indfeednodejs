const RssParser = require('rss-parser');

const parser = new RssParser();

module.exports = {
  parseRssFeed: (rssUrl) => {
    return parser.parseURL(rssUrl);
  },
};