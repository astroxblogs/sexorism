// server/models/Subscriber.js
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    // This array will store categories/tags inferred from user behavior
    inferredCategories: {
        type: [String], // Array of strings (e.g., ['technology', 'science', 'health'])
        default: []
    }
    // REMOVE THE subscriberId FIELD AND THE pre('save') HOOK ENTIRELY
    // subscriberId: {
    //     type: String,
    //     unique: true,
    //     required: false // Or true if you want it, but it's causing issues. Best to remove.
    // }
});

// REMOVE THIS ENTIRE HOOK:
// subscriberSchema.pre('save', function (next) {
//     if (this.isNew && !this.subscriberId) {
//         this.subscriberId = new mongoose.Types.ObjectId().toString(); // Generate a unique ID
//     }
//     next();
// });

module.exports = mongoose.model('Subscriber', subscriberSchema);