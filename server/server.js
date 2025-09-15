require('dotenv').config();


console.log('CORS_ORIGIN_DEV:', process.env.CORS_ORIGIN_DEV);
console.log('CORS_ORIGIN_PROD:', process.env.CORS_ORIGIN_PROD);
console.log('CORS_ORIGIN_Main:', process.env.CORS_ORIGIN_Main);


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const blogRoutes = require('./routes/blogs');
const subscriberRoutes = require('./routes/subscribers');

const { startEmailJob } = require('./jobs/sendPersonalizedEmails');
const app = express();



// Build CORS allowlist (ignore empty envs, normalize without trailing slash)
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

// In development, also allow common localhost origins
if (process.env.NODE_ENV !== 'production') {
    const devOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:8081'
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


app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use('/api/blogs', blogRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Test route for debugging
app.post('/api/test-subscriber', (req, res) => {
    console.log('Test subscriber route hit');
    console.log('Request body:', req.body);
    res.json({ msg: 'Test route working', body: req.body });
});

// Default route
app.get('/', (req, res) => {
    res.send('innvibs Backend API is running!');
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        startEmailJob();
    })
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8081;

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        msg: 'Internal Server Error', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));