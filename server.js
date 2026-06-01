const http = require('https');
const fs = require('fs');
const path = require('path');

const handler = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const auth = req.headers['authorization'] || '';
      const opts = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth,
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const proxy = http.request(opts, pr => {
        res.writeHead(pr.statusCode, {'Content-Type': 'application/json'});
        pr.pipe(res);
      });
      proxy.on('error', e => {
        res.writeHead(502, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: {message: e.message}}));
      });
      proxy.write(body);
      proxy.end();
    });
    return;
  }

  res.writeHead(404); res.end('Not found');
};

module.exports = handler;