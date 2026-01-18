const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
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
        towerNumber: {
            type: String,
            required: true,
        },
        flatNumber: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Accepted', 'On The Way', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        orderType: {
            type: String,
            enum: ['One-time', 'Subscription'],
            default: 'One-time',
        },
        timeSlot: {
            type: String,
            default: 'Anytime',
        },
        paymentMode: {
            type: String,
            enum: ['COD', 'wallet', 'online'],
            default: 'COD',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
            default: 'Pending',
        },
        paymentTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
        },
        bottlesReturned: {
            type: Number,
            default: 0,
        },
        guardVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
