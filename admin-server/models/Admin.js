const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: {  
        type: String,
        default: null  
    },
    role: {
        type: String,
        enum: ['admin', 'operator'],
        default: 'admin',
        required: true
    }
});

module.exports = mongoose.model('Admin', AdminSchema);