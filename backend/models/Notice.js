const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema(
    {
        society: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Society',
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
