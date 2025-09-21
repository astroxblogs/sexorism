// server/server.js - AWS PRODUCTION VERSION (API-Only) - FIXED CORS

require('dotenv').config();
// Add this line at the top of server.js (after require statements)
console.log('🚀 SERVER VERSION: AWS-PRODUCTION-2024-09-21-FIXED-CORS');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const blogRoutes = require('./routes/blogs');
const subscriberRoutes = require('./routes/subscribers');
const socialPreviewRoutes = require('./routes/socialPreview');
const { startEmailJob } = require('./jobs/sendPersonalizedEmails');
const app = express();

// --- CORS and Body Parser Setup ---
const normalizeOrigin = (value) => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const allowedOrigins = [
    // normalizeOrigin(process.env.CORS_ORIGIN_DEV),
     normalizeOrigin(process.env.CORS_ORIGIN_PROD),
    normalizeOrigin(process.env.CORS_ORIGIN_Main),
     normalizeOrigin(process.env.FRONTEND_URL),
    'http://65.1.60.27:80',  // AWS Load Balancer - DIRECT ADD
    'http://localhost:3000',
    'http://localhost:3001'
].filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
    const devOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081'
    ];
    for (const o of devOrigins) {
        if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
    }
}

// AWS load balancer origin already added above

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeOrigin(origin);
        const isAllowed = allowedOrigins.includes(normalizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            // Log for debugging
            console.log('CORS Debug:');
            console.log('- Request Origin:', origin);
            console.log('- Normalized Origin:', normalizedOrigin);
            console.log('- Allowed Origins:', allowedOrigins);
            console.log('- Is Allowed:', isAllowed);

            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            callback(new Error(msg), false);
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- ROUTING LOGIC ---

// 1. Social media preview routes (Should come before API routes)
app.use('/', socialPreviewRoutes);

// 2. API routes only (No static file serving for AWS)
app.use('/api/blogs', blogRoutes);
app.use('/api/subscribers', subscriberRoutes);

// 3. Social media preview routes (must come before React app routes)
app.use('/', socialPreviewRoutes);

// 3. Root endpoint for AWS load balancer
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'InnVibs Blog API Server',
        version: 'AWS-PRODUCTION-2024-09-21',
        endpoints: {
            health: '/health',
            api: '/api/blogs',
            socialPreview: '/blog/:slug'
        },
        timestamp: new Date().toISOString()
    });
});

// 4. Health check endpoint for AWS load balancer
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Database and Server Start ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        startEmailJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8081;

// 404 handler for unmatched routes (using a more compatible pattern)
app.use((req, res) => {
    console.log(`Route not found: ${req.method} ${req.originalUrl}`);

    // If it's an API route, return JSON error
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            error: 'API endpoint not found',
            message: `Cannot ${req.method} ${req.originalUrl}`,
            availableEndpoints: {
                root: '/',
                health: '/health',
                api: '/api/blogs',
                socialPreview: '/blog/:slug'
            }
        });
    }

    // For all other routes, return a simple message
    // (Frontend is on different domain, so no need to serve React app)
    res.status(404).json({
        error: 'Page not found',
        message: 'This endpoint is not available on the API server',
        note: 'Visit https://www.innvibs.com for the main website'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        msg: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

