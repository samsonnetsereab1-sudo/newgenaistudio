// CommonJS version
const express = require('express');
const app = express();

console.log('🔧 Setting up middleware...');
app.use(express.json());

console.log('🔧 Setting up route...');
app.post('/test', (req, res) => {
  console.log('✅ POST RECEIVED!');
  console.log('Body:', req.body);
  res.json({ success: true });
});

console.log('🔧 Starting server...');
app.listen(4003, () => {
  console.log('✅ Server running on port 4003');
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err);
  process.exit(1);
});
