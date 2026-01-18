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
        subject: `${otp} is your JalConnect Verification Code`,
        htmlContent: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0ea5e9; margin: 0; font-size: 28px; font-weight: 800;">JalConnect</h1>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Pure Water, Pure Convenience</p>
                </div>
                
                <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
                    <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Verification Code</h2>
                    <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">Hi ${name}, use the code below to complete your registration.</p>
                    
                    <div style="background: #0ea5e9; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);">
                        ${otp}
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">This code will expire in 10 minutes.</p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 10px;">If you didn't request this code, you can safely ignore this email.</p>
                    <p style="color: #94a3b8; font-size: 11px;">&copy; 2026 JalConnect. All rights reserved.</p>
                </div>
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
