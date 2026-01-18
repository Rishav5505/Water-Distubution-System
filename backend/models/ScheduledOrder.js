const mongoose = require('mongoose');

const scheduledOrderSchema = mongoose.Schema(
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
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        timeSlot: {
            type: String,
            enum: ['06:00 AM - 09:00 AM', '09:00 AM - 12:00 PM', '04:00 PM - 08:00 PM'],
            default: '06:00 AM - 09:00 AM',
        },
        recurring: {
            type: Boolean,
            default: false,
        },
        frequency: {
            type: String,
            enum: ['Daily', 'Weekly', 'Monthly', 'None'],
            default: 'None',
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Executed', 'Cancelled'],
            default: 'Scheduled',
        },
        executedOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        notes: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const ScheduledOrder = mongoose.model('ScheduledOrder', scheduledOrderSchema);

module.exports = ScheduledOrder;
