const mongoose = require('mongoose');

const waterQualitySchema = mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Society',
        },
        tdsLevel: {
            type: Number,
            required: true,
        },
        phLevel: {
            type: Number,
            required: true,
        },
        bacterialCount: {
            type: String, // e.g., "Absent", "Low"
            required: true,
        },
        testedAt: {
            type: Date,
            default: Date.now,
        },
        reportUrl: {
            type: String, // Link to PDF or Image
        },
        status: {
            type: String,
            enum: ['Excellent', 'Good', 'Fair', 'Poor'],
            default: 'Good',
        }
    },
    {
        timestamps: true,
    }
);

const WaterQuality = mongoose.model('WaterQuality', waterQualitySchema);

module.exports = WaterQuality;
