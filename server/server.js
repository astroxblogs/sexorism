// server/server.js - FINAL VERSION 5 (Fixes PathError with Regex)

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const prerender = require('prerender-node');
const path = require('path');

const blogRoutes = require('./routes/blogs');
const subscriberRoutes = require('./routes/subscribers');
const socialPreviewRoutes = require('./routes/socialPreview');
const { startEmailJob } = require('./jobs/sendPersonalizedEmails');
const app = express();

// --- PRERENDER.IO MIDDLEWARE (Correctly placed at the top) ---
if (process.env.PRERENDER_TOKEN) {
    app.use(
        prerender
            .set('prerenderToken', process.env.PRERENDER_TOKEN)
            .set('forwardHeaders', true)
            .set('protocol', 'https')
            .whitelisted('^www.innvibs.com')
    );
}

// --- CORS and Body Parser Setup ---
// (Your CORS logic remains unchanged)
const normalizeOrigin = (value) => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const allowedOrigins = [
    normalizeOrigin(process.env.CORS_ORIGIN_DEV),
    normalizeOrigin(process.env.CORS_ORIGIN_PROD),
    normalizeOrigin(process.env.CORS_ORIGIN_Main)
].filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
    const devOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081'
    ];
    for (const o of devOrigins) {
        if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const normalizedOrigin = normalizeOrigin(origin);
        const isAllowed = allowedOrigins.includes(normalizedOrigin);
        if (isAllowed) {
            callback(null, true);
        } else {
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

// 2. API routes (Should come before static file serving)
app.use('/api/blogs', blogRoutes);
app.use('/api/subscribers', subscriberRoutes);

// 2. Serve the React Application's static files
const buildPath = path.join(__dirname, '../client/build');
app.use(express.static(buildPath));

// 3. The "catchall" handler for client-side routing.
// This must come AFTER API routes and static file serving.
// ✅ FINAL FIX: Using a Regular Expression to match all non-API routes.
// This is the most reliable way to create a catch-all for a Single Page App.
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


// --- Database and Server Start ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        startEmailJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8081;

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        msg: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

