const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema(
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
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        category: {
            type: String,
            required: true,
            enum: ['Late Delivery', 'Quality Issue', 'Billing Issue', 'Behavior', 'Other'],
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Open', 'In Progress', 'Resolved'],
            default: 'Open',
        },
        resolution: String,
    },
    {
        timestamps: true,
    }
);

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
