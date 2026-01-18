const mongoose = require('mongoose');

const usageAnalyticsSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true,
        },
        monthlyUsage: [
            {
                month: String, // Format: "2026-01"
                totalBottles: Number,
                totalSpent: Number,
                orderCount: Number,
                averageOrderSize: Number,
            }
        ],
        totalLifetimeBottles: {
            type: Number,
            default: 0,
        },
        totalLifetimeSpent: {
            type: Number,
            default: 0,
        },
        averageMonthlyConsumption: {
            type: Number,
            default: 0,
        },
        preferredTimeSlot: {
            type: String,
        },
        mostUsedVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
        },
        savingsVsMarket: {
            type: Number,
            default: 0, // Compared to market price
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

const UsageAnalytics = mongoose.model('UsageAnalytics', usageAnalyticsSchema);

module.exports = UsageAnalytics;
