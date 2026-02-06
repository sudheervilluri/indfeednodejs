const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const HOLDINGS_PATH = path.join(DATA_DIR, 'holdings.json');
const NEWS_PATH = path.join(DATA_DIR, 'news.json');
const COMPANIES_PATH = path.join(DATA_DIR, 'companies.json');

const createDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
};

const readJson = (filePath, fallback) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const seedData = () => {
  if (!fs.existsSync(HOLDINGS_PATH)) {
    writeJson(HOLDINGS_PATH, [
      {
        symbol: 'RELIANCE.NS',
        shares: 5,
        avgPrice: 2894.5,
        addedAt: '2024-08-12T09:15:00Z'
      },
      {
        symbol: 'TCS.NS',
        shares: 3,
        avgPrice: 3925.1,
        addedAt: '2024-08-11T11:20:00Z'
      }
    ]);
  }

  if (!fs.existsSync(NEWS_PATH)) {
    writeJson(NEWS_PATH, [
      {
        id: 'news-1',
        source: 'Moneycontrol',
        title: 'Reliance shares climb on retail expansion update',
        symbol: 'RELIANCE.NS',
        publishedAt: '2024-08-12T10:00:00Z'
      },
      {
        id: 'news-2',
        source: 'Economic Times',
        title: 'TCS wins large transformation deal in Europe',
        symbol: 'TCS.NS',
        publishedAt: '2024-08-10T14:30:00Z'
      },
      {
        id: 'news-3',
        source: 'Business Standard',
        title: 'Banking stocks rise as credit growth holds steady',
        symbol: 'HDFCBANK.NS',
        publishedAt: '2024-08-09T15:45:00Z'
      }
    ]);
  }

  if (!fs.existsSync(COMPANIES_PATH)) {
    writeJson(COMPANIES_PATH, [
      { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
      { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
      { symbol: 'INFY.NS', name: 'Infosys' },
      { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
      { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
      { symbol: 'SBIN.NS', name: 'State Bank of India' },
      { symbol: 'ITC.NS', name: 'ITC Limited' },
      { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
      { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
      { symbol: 'LT.NS', name: 'Larsen & Toubro' },
      { symbol: 'ASIANPAINT.NS', name: 'Asian Paints' },
      { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
      { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
      { symbol: 'AXISBANK.NS', name: 'Axis Bank' },
      { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' }
    ]);
  }
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const parseJsonBody = req =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });

const fetchYahooQuotes = symbols =>
  new Promise(resolve => {
    const filtered = symbols.filter(Boolean);
    if (!filtered.length) {
      resolve([]);
      return;
    }
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
      filtered.join(',')
    )}`;
    https
      .get(url, response => {
        let data = '';
        response.on('data', chunk => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            const payload = JSON.parse(data);
            const results = payload.quoteResponse?.result || [];
            resolve(
              results.map(item => ({
                symbol: item.symbol,
                price: item.regularMarketPrice,
                change: item.regularMarketChange,
                changePercent: item.regularMarketChangePercent
              }))
            );
          } catch (error) {
            resolve([]);
          }
        });
      })
      .on('error', () => resolve([]));
  });

const getContentType = filePath => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'application/javascript';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'text/plain';
  }
};

const serveStatic = (req, res, pathname) => {
  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath === '/' ? 'index.html' : safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(indexPath).pipe(res);
};

createDataDir();
seedData();

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = requestUrl;

  if (pathname === '/api/holdings' && req.method === 'GET') {
    return sendJson(res, 200, readJson(HOLDINGS_PATH, []));
  }

  if (pathname === '/api/holdings' && req.method === 'POST') {
    try {
      const { symbol, shares, avgPrice } = await parseJsonBody(req);
      if (!symbol || Number.isNaN(Number(shares)) || Number.isNaN(Number(avgPrice))) {
        return sendJson(res, 400, { message: 'symbol, shares, and avgPrice are required.' });
      }

      const holdings = readJson(HOLDINGS_PATH, []);
      const normalizedSymbol = symbol.toUpperCase();
      const payload = {
        symbol: normalizedSymbol,
        shares: Number(shares),
        avgPrice: Number(avgPrice),
        addedAt: new Date().toISOString()
      };
      const existingIndex = holdings.findIndex(item => item.symbol === normalizedSymbol);
      if (existingIndex >= 0) {
        holdings[existingIndex] = payload;
      } else {
        holdings.push(payload);
      }

      writeJson(HOLDINGS_PATH, holdings);
      return sendJson(res, 201, payload);
    } catch (error) {
      return sendJson(res, 400, { message: 'Invalid JSON payload.' });
    }
  }

  if (pathname.startsWith('/api/holdings/') && req.method === 'DELETE') {
    const symbol = pathname.split('/').pop().toUpperCase();
    const holdings = readJson(HOLDINGS_PATH, []);
    const filtered = holdings.filter(item => item.symbol !== symbol);
    writeJson(HOLDINGS_PATH, filtered);
    return sendJson(res, 200, { message: 'Removed', symbol });
  }

  if (pathname === '/api/news' && req.method === 'GET') {
    return sendJson(res, 200, readJson(NEWS_PATH, []));
  }

  if (pathname === '/api/companies' && req.method === 'GET') {
    return sendJson(res, 200, readJson(COMPANIES_PATH, []));
  }

  if (pathname === '/api/prices' && req.method === 'GET') {
    const symbols = requestUrl.searchParams.get('symbols');
    const list = symbols ? symbols.split(',').map(item => item.trim()) : [];
    const quotes = await fetchYahooQuotes(list);
    return sendJson(res, 200, quotes);
  }

  if (pathname === '/api/summary' && req.method === 'GET') {
    const holdings = readJson(HOLDINGS_PATH, []);
    const totalCost = holdings.reduce((sum, holding) => sum + holding.shares * holding.avgPrice, 0);
    return sendJson(res, 200, {
      totalHoldings: holdings.length,
      totalCost: Number(totalCost.toFixed(2))
    });
  }

  return serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Portfolio tracker running on http://localhost:${PORT}`);
});
