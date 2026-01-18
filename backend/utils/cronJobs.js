const cron = require('node-cron');
const User = require('../models/User');
const Order = require('../models/Order');
const { generateInvoicePDF } = require('./invoiceGenerator');
const nodemailer = require('nodemailer');

// Setup Nodemailer (You'll need real SMTP details in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const setupCronJobs = () => {
    // Run at 00:00 on the 1st of every month
    cron.schedule('0 0 1 * *', async () => {
        console.log('Running Monthly Invoice Automation...');

        const now = new Date();
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const month = monthNames[lastMonthDate.getMonth()];
        const year = lastMonthDate.getFullYear();

        const startDate = new Date(year, lastMonthDate.getMonth(), 1);
        const endDate = new Date(year, lastMonthDate.getMonth() + 1, 0, 23, 59, 59);

        try {
            const users = await User.find({ role: 'user' });

            for (const user of users) {
                const orders = await Order.find({
                    user: user._id,
                    status: 'Delivered',
                    createdAt: { $gte: startDate, $lte: endDate }
                });

                if (orders.length > 0) {
                    const pdfBuffer = await generateInvoicePDF(user, orders, month, year);

                    // Email configuration
                    const mailOptions = {
                        from: `"JalConnect Support" <${process.env.EMAIL_USER}>`,
                        to: user.email,
                        subject: `Your JalConnect Invoice for ${month} ${year}`,
                        text: `Hi ${user.name},\n\nPlease find attached your monthly water delivery invoice for ${month} ${year}.\n\nTotal Bottles: ${orders.reduce((s, o) => s + o.quantity, 0)}\nTotal Amount: ₹${orders.reduce((s, o) => s + o.totalAmount, 0)}\n\nThank you for using JalConnect!`,
                        attachments: [
                            {
                                filename: `Invoice_${month}_${year}.pdf`,
                                content: pdfBuffer
                            }
                        ]
                    };

                    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                        await transporter.sendMail(mailOptions);
                        console.log(`Invoice emailed to ${user.email}`);
                    } else {
                        console.log(`Skipping email for ${user.email} (SMTP not configured)`);
                    }
                }
            }
        } catch (error) {
            console.error('Cron Job Error:', error);
        }
    });

    console.log('✅ Monthly Invoice Cron Job Scheduled');
};

module.exports = { setupCronJobs };
