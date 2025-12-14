import http from 'http';

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'pong from native HTTP' }));
});

server.listen(7000, () => {
  console.log('Native HTTP server listening on port 7000');
});

server.on('connection', (socket) => {
  console.log('Connection from', socket.remoteAddress);
});
