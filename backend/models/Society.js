const mongoose = require('mongoose');

const societySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // The person who created this society
        },
        isEmergencyRestriction: {
            type: Boolean,
            default: false,
        },
        restrictionLimit: {
            type: Number,
            default: 1, // Max bottles per flat per day during restriction
        },
        settings: {
            allowAutoAssignment: { type: Boolean, default: true },
            taxRate: { type: Number, default: 5 }, // GST etc
            deliveryTimeSlots: [
                { type: String, default: ['06:00 AM - 09:00 AM', '09:00 AM - 12:00 PM', '04:00 PM - 08:00 PM'] }
            ]
        }
    },
    {
        timestamps: true,
    }
);

const Society = mongoose.model('Society', societySchema);
module.exports = Society;
