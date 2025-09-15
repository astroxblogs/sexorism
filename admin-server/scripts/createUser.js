require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const readline = require('readline'); // Import readline for command-line input

// Create an interface to read from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * A utility function to ask a question in the terminal and get the answer.
 * @param {string} question The question to display in the terminal.
 * @returns {Promise<string>} The user's answer.
 */
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting admin creation script...');
    
    // --- Step 1: Connect to the database ---
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGO_URI is not defined in your .env file.');
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // --- Step 2: Check if an admin already exists ---
    const adminCount = await Admin.countDocuments({ role: 'admin' });
    console.log(`ℹ️ Found ${adminCount} admin user(s) in the database.`);
    
    if (adminCount > 0) {
      console.log('ℹ️ An admin user already exists. If you need to change credentials, please do so from the admin dashboard.');
      console.log('ℹ️ Halting script to prevent creating duplicate admins.');
      process.exit(0);
    }
    
    console.log('No admin found. Proceeding with initial admin creation...');

    // --- Step 3: Interactively and securely get credentials ---
    const username = "Astrox"; // await askQuestion('Enter the desired admin username: ');
    const password = "Innvibs@123"; // await askQuestion('Enter the desired admin password: ');
    
    // Safety checks
    if (!username || !password) {
      throw new Error('Username and password cannot be empty!');
    }
    
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully.');

    console.log('👷 Creating admin user...', username, "   " , hashedPassword);
    
    // --- Step 4: Create the new admin ---
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      role: 'admin',
    });
    await newAdmin.save();
    console.log(`✅ Admin user '${username}' created successfully!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  } finally {
    // Ensure mongoose connection and readline interface are closed.
    mongoose.connection.close();
    rl.close();
  }
}

main();
