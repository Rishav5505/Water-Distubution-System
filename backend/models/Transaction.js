const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true,
        },
        wallet: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Wallet',
        },
        type: {
            type: String,
            required: true,
            enum: [
                'recharge',       // Wallet top-up
                'order',          // Order payment
                'refund',         // Order cancellation refund
                'cashback',       // Cashback credit
                'subscription',   // Subscription payment
                'penalty',        // Penalty deduction
                'bonus',          // Bonus/reward
            ],
        },
        transactionType: {
            type: String,
            required: true,
            enum: ['credit', 'debit'],
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        balanceBefore: {
            type: Number,
            default: 0,
        },
        balanceAfter: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'completed', 'failed', 'cancelled'],
            default: 'completed',
        },
        paymentMethod: {
            type: String,
            enum: ['razorpay', 'upi', 'card', 'netbanking', 'wallet', 'cash'],
        },
        paymentGateway: {
            orderId: String,           // Razorpay order_id
            paymentId: String,         // Razorpay payment_id
            signature: String,         // Razorpay signature
        },
        relatedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        relatedSubscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        description: {
            type: String,
            default: '',
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        transactionDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
