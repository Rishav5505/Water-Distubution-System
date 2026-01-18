const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { guard } = require('../middleware/guardMiddleware');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const Society = require('../models/Society');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

// ================= SECURITY GUARD MODULE =================

// @desc    Verify delivery at gate
// @route   POST /api/enterprise/guard/verify
router.post('/guard/verify', protect, guard, async (req, res) => {
    const { orderId, bottlesIn, bottlesOut } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.guardVerified = true;
        order.bottlesReturned = bottlesOut || 0;
        await order.save();

        // Update Vendor Inventory
        const vendor = await Vendor.findById(order.vendor);
        if (vendor) {
            vendor.inventory -= order.quantity; // Bottles gone out
            vendor.inventory += (bottlesOut || 0); // Empty bottles returned to vendor
            await vendor.save();
        }

        res.json({ message: 'Delivery verified by guard', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= AUTOMATED BILLING MODULE =================

// @desc    Generate monthly invoices for a society
// @route   POST /api/enterprise/admin/generate-bills
router.post('/admin/generate-bills', protect, async (req, res) => {
    const { month, year, societyId } = req.body;
    try {
        const society = await Society.findById(societyId);
        const users = await User.find({ society: societyId, role: 'user' });

        const invoices = [];
        for (const user of users) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0);

            const orders = await Order.find({
                user: user._id,
                status: 'Delivered',
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            if (orders.length > 0) {
                const totalBottles = orders.reduce((sum, o) => sum + o.quantity, 0);
                const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
                const tax = (totalAmount * (society.settings.taxRate || 5)) / 100;

                const invoice = await Invoice.create({
                    user: user._id,
                    society: societyId,
                    month: `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startOfMonth)} ${year}`,
                    orders: orders.map(o => o._id),
                    totalBottles,
                    totalAmount,
                    tax,
                    grandTotal: totalAmount + tax
                });
                invoices.push(invoice);
            }
        }
        res.json({ message: `${invoices.length} Invoices generated`, invoices });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= ABNORMAL USAGE DETECTION =================

// @desc    Get usage reports and alerts
// @route   GET /api/enterprise/admin/usage-alerts
router.get('/admin/usage-alerts', protect, async (req, res) => {
    try {
        const threshold = 5; // Alert if > 5 bottles in a day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alerts = await Order.aggregate([
            { $match: { createdAt: { $gte: today }, status: 'Delivered' } },
            { $group: { _id: '$user', total: { $sum: '$quantity' } } },
            { $match: { total: { $gt: threshold } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } }
        ]);

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= EMERGENCY RESTRICTION =================

// @desc    Toggle emergency water restriction
// @route   PUT /api/enterprise/admin/restriction
router.put('/admin/restriction', protect, async (req, res) => {
    const { societyId, isEmergency, limit } = req.body;
    try {
        const society = await Society.findById(societyId);
        society.isEmergencyRestriction = isEmergency;
        society.restrictionLimit = limit;
        await society.save();
        res.json({ message: 'Restriction updated', society });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
