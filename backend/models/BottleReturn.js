const mongoose = require('mongoose');

const bottleReturnSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        quantityReturned: {
            type: Number,
            required: true,
        },
        depositRefund: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Pending', 'Collected', 'Verified'],
            default: 'Pending',
        },
        collectedBy: {
            type: String, // Guard or Vendor name
        },
        collectionDate: {
            type: Date,
        },
        notes: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const BottleReturn = mongoose.model('BottleReturn', bottleReturnSchema);

module.exports = BottleReturn;
