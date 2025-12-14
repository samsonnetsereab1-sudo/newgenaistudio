import express from 'express';

const app = express();

app.get('/ping', (req, res) => {
  console.log('PING received!');
  res.json({ message: 'pong' });
});

const server = app.listen(6000, () => {
  console.log('Minimal server listening on port 6000');
});

server.on('connection', (socket) => {
  console.log('Connection from', socket.remoteAddress);
});
