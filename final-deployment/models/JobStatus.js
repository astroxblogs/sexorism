// server/models/JobStatus.js
const mongoose = require('mongoose');

const jobStatusSchema = new mongoose.Schema({
    jobName: {
        type: String,
        required: true,
        unique: true, // Ensure only one document per job name (e.g., 'personalizedEmailJob')
        trim: true
    },
    lastRunAt: {
        type: Date,
        default: null // Will be updated to Date.now() on successful run
    },
    lastRunStatus: {
        type: String,
        enum: ['success', 'failed'], // Optional: store status
        default: null
    },
    lastErrorMessage: {
        type: String,
        default: null // Optional: store error message on failure
    }
}, { timestamps: true }); // timestamps for createdAt and updatedAt

module.exports = mongoose.model('JobStatus', jobStatusSchema);