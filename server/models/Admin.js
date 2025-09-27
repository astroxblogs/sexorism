const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
    role: {
        type: String,
        enum: ['admin', 'operator'],
        default: 'admin',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    }
}, {
    timestamps: true // Optional: adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Admin', AdminSchema);

