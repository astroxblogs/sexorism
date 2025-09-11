require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function main() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const username = process.env.SEED_USER_USERNAME  
    const password = process.env.SEED_USER_PASSWORD  
    const role = process.env.SEED_USER_ROLE  

    if (!mongoUri) {
        console.error('Missing MONGODB_URI or MONGO_URI in environment.');
        process.exit(1);
    }

    if (!['admin', 'operator'].includes(role)) {
        console.error('SEED_USER_ROLE must be "admin" or "operator".');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    try {
        const hash = await bcrypt.hash(password, 10);
        const update = { username, password: hash, role };
        const user = await Admin.findOneAndUpdate(
            { username },
            { $set: update, $setOnInsert: { refreshToken: null } },
            { upsert: true, new: true }
        );
        console.log(`User '${username}' (${role}) is ready. _id=${user._id}`);
    } catch (err) {
        console.error('Failed to create/update user:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

main();


