const mongoose = require('mongoose');

const prepaidPlanSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        bonusAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalValue: {
            type: Number,
            required: true,
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        validity: {
            type: Number, // in days
            default: 365,
        },
        description: {
            type: String,
            default: '',
        },
        features: [
            {
                type: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for discount amount
prepaidPlanSchema.virtual('bonusPercentage').get(function () {
    if (this.amount > 0) {
        return ((this.bonusAmount / this.amount) * 100).toFixed(2);
    }
    return 0;
});

const PrepaidPlan = mongoose.model('PrepaidPlan', prepaidPlanSchema);

module.exports = PrepaidPlan;
