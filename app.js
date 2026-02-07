const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const HOLDINGS_PATH = path.join(DATA_DIR, 'holdings.json');
const NEWS_PATH = path.join(DATA_DIR, 'news.json');

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
        symbol: 'AAPL',
        shares: 12,
        avgPrice: 182.45,
        addedAt: '2024-08-12T09:15:00Z'
      },
      {
        symbol: 'MSFT',
        shares: 8,
        avgPrice: 392.1,
        addedAt: '2024-08-11T11:20:00Z'
      }
    ]);
  }

  if (!fs.existsSync(NEWS_PATH)) {
    writeJson(NEWS_PATH, [
      {
        id: 'news-1',
        source: 'MarketWatch',
        title: 'AI demand pushes cloud earnings outlook higher',
        symbol: 'MSFT',
        publishedAt: '2024-08-12T10:00:00Z'
      },
      {
        id: 'news-2',
        source: 'Bloomberg',
        title: 'Apple unveils next-gen chips for on-device AI',
        symbol: 'AAPL',
        publishedAt: '2024-08-10T14:30:00Z'
      },
      {
        id: 'news-3',
        source: 'Reuters',
        title: 'Markets steady as investors parse inflation data',
        symbol: 'SPY',
        publishedAt: '2024-08-09T15:45:00Z'
      }
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
