import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/generate`);
  console.log(`   GET  /api/v1/projects`);
  console.log(`   GET  /api/v1/templates`);
  console.log(`   GET  /api/v1/biologics/summary`);
  console.log(`   GET  /api/v1/biologics/pipelines`);
  console.log(`   POST /api/v1/agents/orchestrate`);
});
