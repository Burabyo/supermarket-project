import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import salesRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';
import auditRoutes from './routes/audit.js';
import { initializeDatabase } from './database/init.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - FIXED
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://supermarket-project-production.up.railway.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware - MUST come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
try {
  await initializeDatabase();
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// Health check - FIRST route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    routes: ['/api/auth', '/api/users', '/api/products', '/api/sales', '/api/dashboard', '/api/audit']
  });
});

// API Routes - CRITICAL: These MUST be registered properly
console.log('🔗 Registering API routes...');

app.use('/api/auth', (req, res, next) => {
  console.log(`Auth route: ${req.method} ${req.path}`);
  next();
}, authRoutes);

app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/audit', authenticateToken, auditRoutes);

console.log('✅ API routes registered');

// Serve static files in production - AFTER API routes
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  console.log(`📁 Serving static files from: ${distPath}`);
  
  app.use(express.static(distPath));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        success: false, 
        message: `API route ${req.path} not found`,
        availableRoutes: ['/api/auth', '/api/users', '/api/products', '/api/sales', '/api/dashboard', '/api/audit']
      });
    }
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`❌ 404 - API route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    message: `API route ${req.method} ${req.path} not found`,
    availableRoutes: ['/api/auth', '/api/users', '/api/products', '/api/sales', '/api/dashboard', '/api/audit']
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Server bound to: 0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});