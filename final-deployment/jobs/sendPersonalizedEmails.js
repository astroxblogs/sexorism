// server/jobs/sendPersonalizedEmails.js
const cron = require('node-cron');
const { sendEmail } = require('../services/emailService');
const Subscriber = require('../models/Subscriber');
const Blog = require('../models/Blog');
const JobStatus = require('../models/JobStatus'); // NEW: Import JobStatus model

// Function to generate a simple HTML email for a blog post (unchanged)
const generateEmailHtml = (subscriberName, blog) => {
    const contentPreview = blog.content_en ? blog.content_en.substring(0, 200) + '...' : '';
    const blogUrl = `https://www.innvibs.com/blog/${blog.slug || blog._id}`; // Use slug if available, fallback to ID

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h1 style="color: #333; text-align: center;">New from innvibs Blog!</h1>
                <p>Hello ${subscriberName || 'Reader'},</p>
                <p>We thought you might be interested in our latest post:</p>
                
                <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <h2 style="color: #007bff; margin-top: 0;">${blog.title_en || blog.title}</h2>
                    ${blog.image ? `<img src="${blog.image}" alt="${blog.title_en || blog.title}" style="max-width: 100%; height: auto; display: block; margin-bottom: 10px; border-radius: 4px;">` : ''}
                    <p>${contentPreview}</p>
                    <p style="text-align: center;">
                        <a href="${blogUrl}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Read Full Article</a>
                    </p>
                </div>
                
                <p>Stay curious and keep exploring!</p>
                <p>The innvibs Blog</p>
                <p style="font-size: 0.8em; color: #777; text-align: center; margin-top: 30px;">
                    Because you said “Yes!” to innvibs — and we never forget a friendly face.
                    <br>
                    <a href="https://www.innvibs.com/unsubscribe" style="color: #777; text-decoration: none;">Unsubscribe</a> | <a href="https://www.innvibs.com/privacy" style="color: #777; text-decoration: none;">Privacy Policy</a>
                </p>
            </div>
        </div>
    `;
};


// Main function to run the email sending job
const sendPersonalizedEmails = async () => {
    console.log('Running personalized email job...');
    const JOB_NAME = 'personalizedEmailJob'; // Unique identifier for this job's status

    let jobStatus;
    let successStatus = 'success';
    let errorMessage = null;

    try {
        // Find or create the job status record
        jobStatus = await JobStatus.findOneAndUpdate(
            { jobName: JOB_NAME },
            { $setOnInsert: { lastRunAt: null, lastRunStatus: null } }, // Set these only on insert
            { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not exists, return new doc
        );

        // Determine the timestamp to fetch blogs from
        // If it's the first run, look back 7 days for initial content
        const fetchBlogsSince = jobStatus.lastRunAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        console.log(`Fetching new blogs published since: ${fetchBlogsSince.toISOString()}`);


        // 1. Fetch new blog posts published since the last run
        const newBlogs = await Blog.find({
            date: { $gte: fetchBlogsSince }
        }).select('_id title title_en content content_en category tags image').lean();

        if (newBlogs.length === 0) {
            console.log('No new blogs found to send. Job finished.');
            jobStatus.lastRunAt = new Date(); // Update run time even if no blogs found
            jobStatus.lastRunStatus = 'success';
            await jobStatus.save();
            return;
        }
        console.log(`Found ${newBlogs.length} new blog(s) published since ${fetchBlogsSince.toISOString()}.`);

        // 2. Fetch all subscribers
        const subscribers = await Subscriber.find().lean();
        if (subscribers.length === 0) {
            console.log('No subscribers found. Job finished.');
            jobStatus.lastRunAt = new Date(); // Update run time even if no subscribers found
            jobStatus.lastRunStatus = 'success';
            await jobStatus.save();
            return;
        }
        console.log(`Found ${subscribers.length} subscribers.`);

        let emailsSentCount = 0;
        let emailsSkippedCount = 0;

        // 3. Match new blogs to subscribers and send personalized emails
        for (const subscriber of subscribers) {
            const relevantBlogsForSubscriber = [];

            for (const blog of newBlogs) {
                const blogTerms = [blog.category, ...(blog.tags || [])].map(term => term.toLowerCase());
                const subscriberInterests = (subscriber.inferredCategories || []).map(interest => interest.toLowerCase());

                const hasOverlap = blogTerms.some(term => subscriberInterests.includes(term));

                if (subscriberInterests.length === 0) {
                    if (relevantBlogsForSubscriber.length === 0 && newBlogs.length > 0) {
                        relevantBlogsForSubscriber.push(newBlogs[0]); // Send them the very latest if they have no interests yet
                    }
                } else if (hasOverlap) {
                    relevantBlogsForSubscriber.push(blog);
                }
            }

            if (relevantBlogsForSubscriber.length > 0) {
                const blogToSend = relevantBlogsForSubscriber[0];

                const emailSubject = `New from innvibs: ${blogToSend.title_en || blogToSend.title}`;
                const emailHtml = generateEmailHtml(subscriber.email.split('@')[0], blogToSend);

                const { success } = await sendEmail(subscriber.email, emailSubject, emailHtml);
                if (success) {
                    emailsSentCount++;
                } else {
                    emailsSkippedCount++; // For failed sends
                }
            } else {
                emailsSkippedCount++; // No relevant blogs for this subscriber
            }
        }
        console.log(`Personalized email job completed. Sent: ${emailsSentCount}, Skipped: ${emailsSkippedCount}`);

    } catch (error) {
        console.error('Error in personalized email job:', error);
        successStatus = 'failed';
        errorMessage = error.message;
    } finally {
        // Update job status in database regardless of success or failure
        if (jobStatus) {
            jobStatus.lastRunAt = new Date();
            jobStatus.lastRunStatus = successStatus;
            jobStatus.lastErrorMessage = errorMessage;
            await jobStatus.save();
            console.log(`Job status updated in DB: lastRunAt=${jobStatus.lastRunAt.toISOString()}, status=${jobStatus.lastRunStatus}`);
        } else {
            console.error('JobStatus document could not be created or found, status not saved to DB.');
        }
    }
};

// Schedule the job (unchanged, will run every minute for testing)
const startEmailJob = () => {
 cron.schedule('0 * * * *',  async () => {
        console.log('Cron job triggered: Checking for new personalized emails to send...');
        await sendPersonalizedEmails();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Adjust to your server's timezone or 'UTC'
    });
    console.log('Personalized email job scheduled.');
};

module.exports = { startEmailJob };