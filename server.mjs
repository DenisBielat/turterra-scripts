import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import the route files
import supabaseRoutes from './routes/supabaseRoutes.js';
import webflowRoutes from './routes/webflowRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://www.turterra.com', 'https://turterra.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Serve static files with CORS headers
app.use('/icons', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.turterra.com');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(join(__dirname, 'icons')));

// Use the imported routes
app.use('/supabase', supabaseRoutes);
app.use('/webflow', webflowRoutes);
app.use('/cloudinary', cloudinaryRoutes);

export default app;
