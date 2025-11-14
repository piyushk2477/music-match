require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./auth');
const passport = require('./spotify-auth');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:8888',
  'http://127.0.0.1:8888'
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list or starts with the allowed base URLs
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin.replace(/\/+$/, '/'))
    );
    
    if (!isAllowed) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}.`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  name: 'musicmatch.sid',
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    // domain: 'yourdomain.com' // Uncomment and set in production
  },
  // Recommended for production
  proxy: process.env.NODE_ENV === 'production',
  // Add session store here if needed (e.g., connect-redis, connect-mongo)
  // store: sessionStore,
  // Add rolling sessions if needed
  // rolling: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes - Auth
app.get('/api/test-db', authRoutes.testDbConnection);
app.post('/api/auth/login', authRoutes.loginUser);
app.get('/api/auth/me', authRoutes.isAuthenticated, authRoutes.getCurrentUser);
app.post('/api/auth/logout', authRoutes.logoutUser);
app.post('/api/auth/set-password', authRoutes.isAuthenticated, authRoutes.setUserPassword);

// Spotify OAuth Routes
app.get('/api/auth/spotify', passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-top-read', 'user-read-recently-played'],
  showDialog: true
}));

app.get('/callback', 
  (req, res, next) => {
    passport.authenticate('spotify', (err, user, info) => {
      if (err) {
        console.error('Spotify auth error:', err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
      if (!user) {
        console.error('No user returned from Spotify');
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
        return res.redirect(`${frontendUrl}/login?error=no_user`);
      }
      req.logIn(user, async (err) => {
        if (err) {
          console.error('Login error:', err);
          const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
          return res.redirect(`${frontendUrl}/login?error=login_failed`);
        }
        
        // Fetch listening minutes from database
        let listeningMinutes = 0;
        try {
          const pool = require('./db');
          const [users] = await pool.query(
            'SELECT listening_minutes FROM users WHERE id = ?',
            [user.id]
          );
          listeningMinutes = users.length > 0 ? users[0].listening_minutes : 0;
        } catch (error) {
          console.error('Error fetching listening minutes:', error);
        }
        
        // Store user in session
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          spotify_id: user.spotify_id,
          isNewUser: user.isNewUser || false,
          listening_minutes: listeningMinutes
        };
        
        console.log('Session created:', {
          sessionId: req.sessionID,
          userId: user.id,
          userName: user.name
        });
        
        console.log('Spotify authentication successful for user:', user.id);
        console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);
        const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
        const redirectUrl = `${frontendUrl}/auth/callback?success=true`;
        console.log('Redirecting to:', redirectUrl);
        return res.redirect(redirectUrl);
      });
    })(req, res, next);
  }
);

// Favorites
app.get('/api/user/favorites', authRoutes.isAuthenticated, authRoutes.getUserFavorites);
app.post('/api/user/favorites/artist', authRoutes.isAuthenticated, authRoutes.addFavoriteArtist);
app.post('/api/user/favorites/song', authRoutes.isAuthenticated, authRoutes.addFavoriteSong);

// User similarity
app.get('/api/user/similarity', authRoutes.isAuthenticated, authRoutes.getUserSimilarity);

// Get all users with their favorites
app.get('/api/users/all', authRoutes.isAuthenticated, authRoutes.getAllUsersWithFavorites);

// Public data
app.get('/api/artists', authRoutes.getAllArtists);
app.get('/api/songs', authRoutes.getAllSongs);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection
app.get('/api/test-db-connection', async (req, res) => {
  try {
    const pool = require('./db');
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      data: rows 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  console.log('Serving static files from:', buildPath);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nServer is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏱️  ${new Date().toISOString()}`);
  console.log('\nAvailable endpoints:');
  console.log(`- GET  /api/health`);
  console.log(`- GET  /api/test-db-connection`);
  console.log(`- POST /api/auth/login`);
  console.log(`- GET  /api/auth/me`);
  console.log(`- POST /api/auth/logout\n`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});
