const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Vendor',
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        frequency: {
            type: String,
            required: true,
            enum: ['Daily', 'Mon-Sat', 'Alternate', 'Custom'],
            default: 'Daily',
        },
        customDays: [
            {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            },
        ],
        status: {
            type: String,
            required: true,
            enum: ['Active', 'Paused', 'Cancelled'],
            default: 'Active',
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        lastGeneratedDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
