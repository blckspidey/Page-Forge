import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdf.routes.js';
import convertRoutes from './routes/convert.routes.js';
import secureRoutes from './routes/secure.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for local dev/testing
  exposedHeaders: ['Content-Disposition']
}));

// Increase JSON body limits to support base64 signatures/images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Page Forge API is healthy.' });
});

// Routing
app.use('/api/pdf', pdfRoutes);
app.use('/api/convert', convertRoutes);
app.use('/api/secure', secureRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Global Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred on the server.'
  });
});

export default app;
