const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Notice = require('../models/Notice');
const WaterQuality = require('../models/WaterQuality');
const Complaint = require('../models/Complaint');
const BottleReturn = require('../models/BottleReturn');


// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await Vendor.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Total Revenue
        const revenueStats = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

        // Today's Orders
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

        res.json({
            totalUsers,
            totalVendors,
            totalOrders,
            totalRevenue,
            todayOrders,
            totalTowers: 24, // As per requirements
            totalFlats: 2400, // 24 * 100
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
router.get('/vendors', protect, admin, async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('user', 'name email');
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update vendor bottle price
// @route   PUT /api/admin/vendors/:id/price
// @access  Private/Admin
router.put('/vendors/:id/price', protect, admin, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (vendor) {
            vendor.pricePerBottle = req.body.price;
            const updatedVendor = await vendor.save();
            res.json(updatedVendor);
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Tower-wise water usage report
// @route   GET /api/admin/reports/tower-wise
// @access  Private/Admin
router.get('/reports/tower-wise', protect, admin, async (req, res) => {
    try {
        const usage = await Order.aggregate([
            { $group: { _id: '$towerNumber', totalBottles: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmount' } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(usage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new society notice
// @route   POST /api/admin/notices
// @access  Private/Admin
router.post('/notices', protect, admin, async (req, res) => {
    try {
        const { society, title, content, priority, expiresAt } = req.body;
        const notice = await Notice.create({
            society,
            title,
            content,
            priority,
            expiresAt
        });
        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all notices
// @route   GET /api/admin/notices
// @access  Private/Admin
router.get('/notices', protect, admin, async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add water quality report
// @route   POST /api/admin/water-quality
// @access  Private/Admin
router.post('/water-quality', protect, admin, async (req, res) => {
    try {
        const { society, tdsLevel, phLevel, bacterialCount, reportUrl, status } = req.body;
        const quality = await WaterQuality.create({
            society,
            tdsLevel,
            phLevel,
            bacterialCount,
            reportUrl,
            status
        });
        res.status(201).json(quality);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private/Admin
router.get('/complaints', protect, admin, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('user', 'name email towerNumber flatNumber')
            .populate('vendor', 'vendorName')
            .populate('order')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id
// @access  Private/Admin
router.put('/complaints/:id', protect, admin, async (req, res) => {
    try {
        const { status, resolution } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = status || complaint.status;
        complaint.resolution = resolution || complaint.resolution;

        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all bottle returns
// @route   GET /api/admin/bottle-returns
// @access  Private/Admin
router.get('/bottle-returns', protect, admin, async (req, res) => {
    try {
        const returns = await BottleReturn.find()
            .populate('user', 'name towerNumber flatNumber')
            .populate('vendor', 'vendorName')
            .sort({ createdAt: -1 });
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify bottle return
// @route   PUT /api/admin/bottle-returns/:id/verify
// @access  Private/Admin
router.put('/bottle-returns/:id/verify', protect, admin, async (req, res) => {
    try {
        const { status, collectedBy } = req.body;
        const bottleReturn = await BottleReturn.findById(req.params.id);

        if (!bottleReturn) {
            return res.status(404).json({ message: 'Bottle return not found' });
        }

        bottleReturn.status = status || 'Verified';
        bottleReturn.collectedBy = collectedBy;
        bottleReturn.collectionDate = Date.now();

        await bottleReturn.save();
        res.json(bottleReturn);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
