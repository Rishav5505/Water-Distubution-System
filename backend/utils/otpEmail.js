const axios = require('axios');

const sendOTPEmail = async (email, otp, name) => {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
        console.error('❌ BREVO_API_KEY not found in environment variables');
        return false;
    }

    const data = {
        sender: { name: 'JalConnect Support', email: process.env.EMAIL_FROM || 'support@jalconnect.com' },
        to: [{ email: email, name: name }],
        subject: `${otp} is your JalConnect Code`,
        htmlContent: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>JalConnect Verification</h2>
                <p>Hello,</p>
                <p>Your verification code is: <b>${otp}</b></p>
                <p>This code will expire in 10 minutes.</p>
                <br />
                <p>Team JalConnect</p>
            </div>
        `
    };

    try {
        console.log(`\n----------------------------`);
        console.log(`🔑 DEBUG OTP for ${email}: ${otp}`);
        console.log(`----------------------------\n`);

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', data, {
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ OTP sent to ${email}: ${response.data.messageId}`);
        return true;
    } catch (error) {
        if (error.response) {
            console.error('❌ Brevo API Error Status:', error.response.status);
            console.error('❌ Brevo API Error Data:', JSON.stringify(error.response.data, null, 2));
            if (error.response.data.code === 'invalid_parameter' && error.response.data.message.includes('sender')) {
                console.error('👉 TIP: Your "Sender Email" is not verified in Brevo. Please use the email you signed up with.');
            }
        } else {
            console.error('❌ Network/Request Error:', error.message);
        }
        return false;
    }
};

module.exports = sendOTPEmail;
