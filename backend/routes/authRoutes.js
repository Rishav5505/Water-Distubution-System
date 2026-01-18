const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Society = require('../models/Society');
const sendOTPEmail = require('../utils/otpEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user & Send OTP
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, towerNumber, flatNumber, role, preferredVendor, society, societies } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists && userExists.isVerified) {
            return res.status(400).json({ message: 'User already exists and is verified. Please login.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user;
        if (userExists) {
            // Update unverified user
            userExists.name = name;
            userExists.password = password;
            userExists.towerNumber = towerNumber;
            userExists.flatNumber = flatNumber;
            userExists.role = role || 'user';
            userExists.preferredVendor = preferredVendor;
            userExists.society = role === 'user' ? society : undefined;
            userExists.societies = role === 'vendor' ? societies : [];
            userExists.otp = otp;
            userExists.otpExpire = otpExpire;
            user = await userExists.save();
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                password,
                towerNumber,
                flatNumber,
                role: role || 'user',
                preferredVendor,
                society: role === 'user' ? society : undefined,
                societies: role === 'vendor' ? societies : [],
                otp,
                otpExpire,
                isVerified: false
            });
        }

        if (user) {
            // Send OTP Email
            const emailSent = await sendOTPEmail(email, otp, name);

            if (emailSent) {
                res.status(201).json({
                    message: 'OTP sent to email. Please verify to complete registration.',
                    email: user.email
                });
            } else {
                res.status(500).json({ message: 'Error sending verification email' });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify OTP & Activate Account
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account is already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Activate User
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        // If role is vendor, create or update vendor profile
        if (user.role === 'vendor') {
            const vendorProfile = await Vendor.findOne({ user: user._id });
            if (!vendorProfile) {
                await Vendor.create({
                    user: user._id,
                    vendorName: user.name,
                    societies: user.societies || []
                });
            } else {
                // Sync societies if vendor profile already existed (e.g. from previous incomplete registration)
                vendorProfile.societies = user.societies || [];
                await vendorProfile.save();
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            message: 'Account verified successfully!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account is already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const emailSent = await sendOTPEmail(email, otp, user.name);

        if (emailSent) {
            res.json({ message: 'New OTP sent to email' });
        } else {
            res.status(500).json({ message: 'Error sending OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                return res.status(401).json({
                    message: 'Account not verified. Please verify your email.',
                    notVerified: true,
                    email: user.email
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                towerNumber: user.towerNumber,
                flatNumber: user.flatNumber,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all societies
router.get('/societies', async (req, res) => {
    try {
        const societies = await Society.find({}).sort({ name: 1 });
        res.json(societies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
