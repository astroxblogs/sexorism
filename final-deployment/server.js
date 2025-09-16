// server/server.js - FINAL FIX

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const blogRoutes = require('./routes/blogs');
const subscriberRoutes = require('./routes/subscribers');
const socialPreviewMiddleware = require('./routes/socialPreview'); 

const { startEmailJob } = require('./jobs/sendPersonalizedEmails');
const app = express();

// --- CORS and Body Parser Setup (No changes here) ---
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
    const devOrigins = [ 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:8081' ];
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

// --- ROUTING LOGIC (WORKAROUND FOR NODE V22 BUG) ---

// 1. API routes
app.use('/api/blogs', blogRoutes);
app.use('/api/subscribers', subscriberRoutes);

// 2. Social Preview Middleware
app.use(socialPreviewMiddleware);

// 3. Serve the React Application's static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'client/build')));

// 4. FINAL WORKAROUND: Instead of app.get('/*'), we use a final middleware.
// This function will only run if no other route above it was matched.
// It sends the main index.html file for any other path, allowing React Router to take over.
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});


// --- Database and Server Start ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        startEmailJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8081;

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        msg: 'Internal Server Error', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));