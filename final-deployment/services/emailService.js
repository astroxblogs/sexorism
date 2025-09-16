
const SibApiV3Sdk = require('@sendinblue/client');
require('dotenv').config(); // Ensure environment variables are loaded

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.EMAIL_SENDER_EMAIL;
const SENDER_NAME = process.env.EMAIL_SENDER_NAME || 'innvibs Blogs'; // Fallback name

if (!BREVO_API_KEY) {
    console.error('ERROR: BREVO_API_KEY environment variable is not set. Emails may not be sent.');
}
if (!SENDER_EMAIL) {
    console.error('ERROR: EMAIL_SENDER_EMAIL environment variable is not set. Emails may not be sent.');
}

// Configure Brevo API client
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = BREVO_API_KEY
 
/**
 * Sends a single email using Brevo.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} htmlContent - The HTML content of the email body.
 * @param {string} [textContent] - Optional plain text content for the email.
 */
exports.sendEmail = async (toEmail, subject, htmlContent, textContent = '') => {
    if (!BREVO_API_KEY || !SENDER_EMAIL) {
        console.error(`Email not sent to ${toEmail}: Brevo API Key or Sender Email is not configured.`);
        return { success: false, message: 'Brevo configuration missing.' };
    }

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // Brevo's email object

    sendSmtpEmail.sender = {
        name: SENDER_NAME,
        email: SENDER_EMAIL
    };
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.textContent = textContent || htmlContent.replace(/<[^>]*>?/gm, ''); // Fallback for text content

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Email sent successfully to ${toEmail} via Brevo. Message ID: ${data.body.messageId}`);
        return { success: true, message: 'Email sent successfully.', messageId: data.body.messageId };
    } catch (error) {
        console.error(`Error sending email to ${toEmail} via Brevo:`, error);
        // Log Brevo specific error details if available
        if (error.response && error.response.text) {
            console.error('Brevo API Error Details:', error.response.text);
        }
        return { success: false, message: 'Failed to send email via Brevo.', error: error.response ? error.response.text : error.message };
    }
};