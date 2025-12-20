const http = require('http');

// Test 1: Simple request
const data = JSON.stringify({ prompt: 'user dashboard' });

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    try {
      const d = JSON.parse(body);
      console.log(`Mode: ${d.mode}`);
      console.log(`Children: ${d.children?.length ?? 0}`);
      console.log(`Problems: ${d.problems?.length ?? 0}`);
      console.log(`Status: ${d.status}`);
      process.exit(0);
    } catch (e) {
      console.log('Parse error:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.log('Request error:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
