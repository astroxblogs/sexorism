const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({path: './.env'});

async function checkAndPopulateDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to TESTING MongoDB');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const Admin = require('./models/Admin');
        const Subscriber = require('./models/Subscriber');
        const Blog = require('./models/Blog');
        const Category = require('./models/Category');

        // Check current data
        const operators = await Admin.countDocuments({ role: 'operator' });
        const subscribers = await Subscriber.countDocuments({});
        const blogs = await Blog.countDocuments({});
        const categories = await Category.countDocuments({});
        const admins = await Admin.countDocuments({ role: 'admin' });

        console.log('📊 CURRENT DATABASE STATUS:');
        console.log(`  👥 Operators: ${operators}`);
        console.log(`  📧 Subscribers: ${subscribers}`);
        console.log(`  📝 Blogs: ${blogs}`);
        console.log(`  🏷️  Categories: ${categories}`);
        console.log(`  🔐 Admins: ${admins}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Create operators if missing
        if (operators === 0) {
            console.log('\\n🔧 CREATING SAMPLE OPERATORS...');

            const sampleOperators = [
                { username: 'operator1', password: 'Operator@123', role: 'operator', isActive: true },
                { username: 'operator2', password: 'Operator@123', role: 'operator', isActive: true },
                { username: 'editor1', password: 'Editor@123', role: 'operator', isActive: false }
            ];

            for (const op of sampleOperators) {
                const existing = await Admin.findOne({ username: op.username });
                if (!existing) {
                    const hashedPassword = await bcrypt.hash(op.password, 10);
                    const newOp = new Admin({
                        username: op.username,
                        password: hashedPassword,
                        role: op.role,
                        isActive: op.isActive
                    });
                    await newOp.save();
                    console.log(`  ✅ Created operator: ${op.username}`);
                }
            }
        }

        // Create subscribers if missing
        if (subscribers === 0) {
            console.log('\\n🔧 CREATING SAMPLE SUBSCRIBERS...');

            const sampleSubscribers = [
                { email: 'john@example.com', subscribedAt: new Date() },
                { email: 'jane@example.com', subscribedAt: new Date() },
                { email: 'user@demo.com', subscribedAt: new Date() }
            ];

            for (const sub of sampleSubscribers) {
                const existing = await Subscriber.findOne({ email: sub.email });
                if (!existing) {
                    const newSub = new Subscriber(sub);
                    await newSub.save();
                    console.log(`  ✅ Created subscriber: ${sub.email}`);
                }
            }
        }

        // Show final status
        const finalOperators = await Admin.countDocuments({ role: 'operator' });
        const finalSubscribers = await Subscriber.countDocuments({});

        console.log('\\n🎉 FINAL STATUS:');
        console.log(`  👥 Operators: ${finalOperators}`);
        console.log(`  📧 Subscribers: ${finalSubscribers}`);
        console.log('\\n✅ DATABASE READY FOR TESTING!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

checkAndPopulateDB();