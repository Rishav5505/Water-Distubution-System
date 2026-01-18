const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        vendorName: {
            type: String,
            required: true,
        },
        pricePerBottle: {
            type: Number,
            required: true,
            default: 30,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
        totalEarnings: {
            type: Number,
            required: true,
            default: 0,
        },
        societies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Society',
            },
        ],
        inventory: {
            type: Number,
            default: 100, // Total bottles in possession
        },
        capacity: {
            type: Number,
            default: 50, // Max orders per day
        },
        currentLoad: {
            type: Number,
            default: 0, // Current orders processing
        },
    },
    {
        timestamps: true,
    }
);

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
