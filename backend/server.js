// Global error handlers FIRST (before any imports that might throw)
process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION - captured. Error:', err && err.stack ? err.stack : err);
  // Do NOT exit; keep server alive and rely on error middleware
});

process.on('unhandledRejection', (reason, p) => {
  console.error('🔥 UNHANDLED REJECTION - captured.');
  console.error('Reason:', reason);
  console.error('Promise:', p);
  // Do NOT exit; keep server alive
});

console.log('✓ Bootstrap starting - PID', process.pid);

import 'dotenv/config';
console.log('✓ Dotenv loaded');

import app from './app.js';
console.log('✓ App imported');


// Ensure server binds to 0.0.0.0 so Windows browser can reach WSL service
const port = process.env.PORT || 4000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
  console.log(`� DEMO_MODE: ${process.env.DEMO_MODE}`);
  console.log(`🔑 OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`🤖 UI_PROVIDER: ${process.env.UI_PROVIDER || 'openai'}`);
  console.log(`💎 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`�📋 Endpoints:`);
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

// Log server errors
server.on('error', (err) => {
  console.error('💥 Server error:', err.message, err.code);
});

// Log when server starts closing
server.on('close', () => {
  console.log('🛑 Server closed');
});

// Diagnostic: log signals/exit to investigate unexpected shutdowns
const logSignal = (sig) => console.warn(`⚠️  Received ${sig} signal`);
process.on('SIGINT', () => logSignal('SIGINT'));
process.on('SIGTERM', () => logSignal('SIGTERM'));
process.on('SIGHUP', () => logSignal('SIGHUP'));
process.on('exit', (code) => console.warn(`⚠️  Process exit with code ${code}`));
