import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5175';
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({ 
  origin: isDevelopment ? '*' : FRONTEND_ORIGIN,
  credentials: true 
}));
app.use(express.json());

// Mount all API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
