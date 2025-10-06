const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const dotenv = require('dotenv');

// --- Dynamic Environment Variable Loading ---
if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: './.env.testing' });
    console.log('✅ Server is starting in TESTING mode, loaded .env.testing');
} else {
    dotenv.config(); // Loads .env by default for production
    console.log('✅ Server is starting in PRODUCTION mode, loaded .env');
}

// --- Route Imports ---
const blogRoutes = require('./routes/blogs');
const categoryRoutes = require('./routes/categories');
const subscriberRoutes = require('./routes/subscribers');
const socialPreviewRoutes = require('./routes/socialPreview');
const adminRoutes = require('./routes/admin'); // ✅ ADDED: Admin routes from your old file

const app = express();

// --- CORS Configuration ---
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`CORS Blocked Origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

// --- Middleware ---
// ✅ ADDED: Increased body parser limits from your old file for larger uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- API Routes ---
app.use('/', socialPreviewRoutes); // Must come before API routes to catch root-level slugs
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/admin', adminRoutes); // ✅ ADDED: Admin routes are now active


// --- Health & Root Endpoints ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    const isProduction = process.env.NODE_ENV !== 'development';
    const version = isProduction ? `AWS-PRODUCTION-${new Date().toISOString().split('T')[0]}` : `AWS-TESTING-${new Date().toISOString().split('T')[0]}`;
    const message = isProduction ? 'InnVibs Blog API Server (Production)' : 'InnVibs Blog API Server (TESTING)';

    res.status(200).json({
        message: message,
        version: version,
        environment: isProduction ? 'production' : 'testing',
        timestamp: new Date().toISOString(),
    });
});


// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('✅ MongoDB connected...', process.env.MONGO_URI);
        // ✅ ADDED: Confirmation message that the job is scheduled on startup
        console.log('🗓️  Daily personalized email job is scheduled to run at 8:00 AM IST.');
    })
    .catch(err => console.log('❌ MongoDB connection error:', err));


// --- Scheduled Jobs ---
// Schedule the email job to run every day at 8:00 AM India Standard Time (IST)
// The cron string '30 2 * * *' in UTC is 8:00 AM in IST (UTC+5:30)
cron.schedule('30 2 * * *', () => {
    console.log('🏃 Running daily personalized email job...');
    // Note: The function to call should be imported if it's not defined in this file.
    // Assuming sendPersonalizedEmails is the correct function from your jobs directory.
    const { sendPersonalizedEmails } = require('./jobs/sendPersonalizedEmails');
    sendPersonalizedEmails();
}, {
    scheduled: true,
    timezone: "UTC"
});


// ✅ ADDED: 404 Handler from your old file
app.use((req, res) => {
    console.log(`Route not found: ${req.method} ${req.originalUrl}`);
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: `API endpoint not found: ${req.originalUrl}` });
    }
    res.status(404).json({ error: 'Page not found' });
});

// ✅ ADDED: Global Error Handler from your old file
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on our end.'
    });
});


// --- Server Start ---
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// ✅ ADDED: Export app for testing purposes
module.exports = app;