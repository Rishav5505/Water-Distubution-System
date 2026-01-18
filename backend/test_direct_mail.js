require('dotenv').config();
const sendOTPEmail = require('./utils/otpEmail');

async function testEmail() {
    console.log('Testing email directly...');
    console.log('SENDER:', process.env.EMAIL_FROM);
    const result = await sendOTPEmail('ittsshruti2004@gmail.com', '123456', 'Shruti');
    console.log('RESULT:', result);
}

testEmail();
