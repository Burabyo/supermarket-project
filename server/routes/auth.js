import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Add logging middleware for auth routes
router.use((req, res, next) => {
  console.log(`🔐 Auth Route: ${req.method} ${req.originalUrl}`);
  console.log(`🔐 Request body:`, req.body);
  next();
});

// Register new user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role')
], async (req, res) => {
  try {
    console.log('📝 Register attempt:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (existingUser) {
        console.log('❌ User already exists:', email);
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role],
        function(err) {
          if (err) {
            console.error('❌ Failed to create user:', err);
            return res.status(500).json({ success: false, message: 'Failed to create user' });
          }

          // Get the created user
          db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [this.lastID], (err, user) => {
            if (err) {
              console.error('❌ Failed to retrieve user:', err);
              return res.status(500).json({ success: false, message: 'User created but failed to retrieve' });
            }

            const token = generateToken(user);
            console.log('✅ User registered successfully:', user.email);

            res.status(201).json({
              success: true,
              message: 'User registered successfully',
              data: {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role
                },
                token
              }
            });
          });
        }
      );
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('🔑 Login attempt:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Login validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], async (err, user) => {
      if (err) {
        console.error('❌ Database error during login:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!user) {
        console.log('❌ User not found or inactive:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const token = generateToken(user);

      // Log the login
      db.run(
        'INSERT INTO audit_logs (user_id, action, table_name) VALUES (?, ?, ?)',
        [user.id, 'LOGIN', 'users']
      );

      console.log('✅ Login successful:', user.email);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout (client-side token removal, but we log it)
router.post('/logout', (req, res) => {
  console.log('👋 Logout request');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Auth test route hit');
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

export default router;