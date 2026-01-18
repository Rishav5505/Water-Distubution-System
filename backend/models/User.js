const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        towerNumber: {
            type: String,
            required: function () { return this.role === 'user'; }
        },
        flatNumber: {
            type: String,
            required: function () { return this.role === 'user'; }
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'vendor', 'admin', 'guard'],
            default: 'user',
        },
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
        },
        societies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
        }],
        language: {
            type: String,
            enum: ['en', 'hi'],
            default: 'en',
        },
        preferredVendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
        },
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        vacationMode: {
            isActive: { type: Boolean, default: false },
            startDate: { type: Date },
            endDate: { type: Date }
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
        },
        otpExpire: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


const User = mongoose.model('User', userSchema);

module.exports = User;
