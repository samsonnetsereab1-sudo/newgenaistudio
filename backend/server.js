// Global error handlers FIRST (before any imports that might throw)
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION - Process will exit. Error:', err && err.stack ? err.stack : err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('🔥 UNHANDLED REJECTION - Promise rejected without handler.');
  console.error('Reason:', reason);
  console.error('Promise:', p);
  process.exit(1);
});

console.log('✓ Bootstrap starting - PID', process.pid);

import 'dotenv/config';
console.log('✓ Dotenv loaded');

import app from './app.js';
console.log('✓ App imported');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`� DEMO_MODE: ${process.env.DEMO_MODE}`);
  console.log(`🔑 OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`);  console.log(`🤖 UI_PROVIDER: ${process.env.UI_PROVIDER || 'openai'}`);
  console.log(`💎 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`);  console.log(`�📋 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/generate`);
  console.log(`   GET  /api/v1/layouts/:id`);
  console.log(`   PUT  /api/v1/layouts/:id`);
  console.log(`   GET  /api/v1/projects`);
  console.log(`   GET  /api/v1/templates`);
  console.log(`   GET  /api/v1/biologics/summary`);
  console.log(`   GET  /api/v1/biologics/pipelines`);
  console.log(`   POST /api/v1/agents/orchestrate`);
});

// Log when a connection is established
server.on('connection', (socket) => {
  console.log('🔌 CONNECTION from', socket.remoteAddress, socket.remotePort);
  
  socket.on('data', (chunk) => {
    console.log('📦 Socket received data:', chunk.length, 'bytes');
  });
  
  socket.on('error', (err) => {
    console.error('🔌 Socket error:', err.message, err.code);
  });
  
  socket.on('close', (hadError) => {
    console.log('🔌 Socket closed', hadError ? 'with error' : 'cleanly');
  });
  
  socket.on('end', () => {
    console.log('🔌 Socket ended');
  });
});

// Log server errors
server.on('error', (err) => {
  console.error('💥 Server error:', err.message, err.code);
});

// Log when server starts closing
server.on('close', () => {
  console.log('🛑 Server closed');
});
