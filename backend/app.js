console.log('1. App.js loading - before imports');

import express from 'express';
import cors from 'cors';
console.log('2. Express and CORS imported');

import routes from './routes/index.js';
console.log('3. Routes imported successfully');

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
console.log('4. Middleware imported');

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5175';
const isDevelopment = process.env.NODE_ENV !== 'production';

console.log('5. Configuring CORS and body parser');
app.use(cors({ 
  origin: isDevelopment ? '*' : FRONTEND_ORIGIN,
  credentials: true 
}));
app.use(express.json({ limit: '5mb' }));
console.log('6. Body parser enabled');

// Mount all API routes
console.log('7. Mounting /api routes');
// Removed request logging middleware to prevent crashes
app.use('/api', routes);
console.log('8. Routes mounted successfully');

// Error handling
app.use(notFound);
app.use(errorHandler);
console.log('9. Error handlers registered');

export default app;
