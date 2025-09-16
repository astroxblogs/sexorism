const Subscriber = require('../models/Subscriber');

// Get all subscribers with email, date and time
const getSubscribers = async (req, res) => {
    try {
        // Fetch all subscribers, sorted by subscription date (newest first)
        const subscribers = await Subscriber.find({})
            .select('email subscribedAt') // Only select email and subscribedAt fields
            .sort({ subscribedAt: -1 }); // Sort by newest first

        // Format the response to match your requirements
        const formattedSubscribers = subscribers.map(subscriber => ({
            id: subscriber._id,
            email: subscriber.email,
            subscribedOn: subscriber.subscribedAt.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: 'Asia/Kolkata'
            }),
            subscribedTime: subscriber.subscribedAt.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata'
            })
        }));

        res.status(200).json({
            success: true,
            count: formattedSubscribers.length,
            subscribers: formattedSubscribers
        });

    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscribers',
            error: error.message
        });
    }
};

// Optional: Get subscriber statistics (you can add this if needed later)
const getSubscriberStats = async (req, res) => {
    try {
        const totalSubscribers = await Subscriber.countDocuments();
        
        // Get subscribers from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSubscribers = await Subscriber.countDocuments({
            subscribedAt: { $gte: sevenDaysAgo }
        });

        // Get subscribers from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const monthlySubscribers = await Subscriber.countDocuments({
            subscribedAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            stats: {
                total: totalSubscribers,
                lastWeek: recentSubscribers,
                lastMonth: monthlySubscribers
            }
        });

    } catch (error) {
        console.error('Error fetching subscriber stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscriber statistics',
            error: error.message
        });
    }
};

module.exports = {
    getSubscribers,
    getSubscriberStats // Optional - you can remove this if not needed
};