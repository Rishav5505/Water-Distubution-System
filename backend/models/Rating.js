const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema(
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
            unique: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: String,
    },
    {
        timestamps: true,
    }
);

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
