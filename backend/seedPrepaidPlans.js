const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PrepaidPlan = require('./models/PrepaidPlan');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const prepaidPlans = [
    {
        name: 'Starter',
        amount: 500,
        bonusAmount: 25,
        totalValue: 525,
        discountPercentage: 5,
        validity: 180,
        description: 'Perfect for trying out prepaid benefits',
        features: [
            '₹25 bonus credit',
            '5% effective discount',
            'Valid for 6 months',
            '2% cashback on orders',
        ],
        isActive: true,
        isPremium: false,
        sortOrder: 1,
    },
    {
        name: 'Smart Saver',
        amount: 1000,
        bonusAmount: 100,
        totalValue: 1100,
        discountPercentage: 10,
        validity: 365,
        description: 'Most popular choice for regular users',
        features: [
            '₹100 bonus credit',
            '10% effective discount',
            'Valid for 1 year',
            '2% cashback on orders',
            'Priority delivery',
        ],
        isActive: true,
        isPremium: false,
        sortOrder: 2,
    },
    {
        name: 'Family Pack',
        amount: 2000,
        bonusAmount: 300,
        totalValue: 2300,
        discountPercentage: 15,
        validity: 365,
        description: 'Best value for families',
        features: [
            '₹300 bonus credit',
            '15% effective discount',
            'Valid for 1 year',
            '2% cashback on orders',
            'Priority delivery',
            'Free complaints resolution',
        ],
        isActive: true,
        isPremium: true,
        sortOrder: 3,
    },
    {
        name: 'Premium Annual',
        amount: 5000,
        bonusAmount: 1000,
        totalValue: 6000,
        discountPercentage: 20,
        validity: 365,
        description: 'Maximum savings for heavy users',
        features: [
            '₹1000 bonus credit',
            '20% effective discount',
            'Valid for 1 year',
            '3% cashback on orders',
            'Priority delivery',
            'Free complaints resolution',
            'Dedicated support',
            'Emergency order quota',
        ],
        isActive: true,
        isPremium: true,
        sortOrder: 4,
    },
];

const seedPrepaidPlans = async () => {
    try {
        // Clear existing plans
        await PrepaidPlan.deleteMany();
        console.log('✅ Cleared existing prepaid plans');

        // Insert new plans
        const created = await PrepaidPlan.insertMany(prepaidPlans);
        console.log(`✅ ${created.length} prepaid plans seeded successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding prepaid plans:', error);
        process.exit(1);
    }
};

seedPrepaidPlans();
