const express = require('express');
const router = express.Router();
const { protect, vendor } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Get all users (customers) in vendor's assigned societies
// @route   GET /api/vendors/customers
// @access  Private/Vendor
router.get('/customers', protect, vendor, async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ user: req.user._id });
        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        // Fetch users who belong to the societies this vendor serves
        const customers = await User.find({
            role: 'user',
            society: { $in: vendorProfile.societies }
        })
            .select('name towerNumber flatNumber society email')
            .populate('society', 'name');

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// @desc    Get vendor profile and stats
// @route   GET /api/vendors/profile
// @access  Private/Vendor
router.get('/profile', protect, vendor, async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ user: req.user._id }).populate('societies', 'name city');
        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }
        res.json(vendorProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get vendor's today's orders
// @route   GET /api/vendors/orders/today
// @access  Private/Vendor
router.get('/orders/today', protect, vendor, async (req, res) => {
    try {
        const { societyId } = req.query;
        const vendorProfile = await Vendor.findOne({ user: req.user._id });
        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        let query = {
            vendor: vendorProfile._id,
            createdAt: { $gte: startOfToday },
        };

        const orders = await Order.find(query)
            .populate('user', 'name email towerNumber flatNumber society')
            .sort({ towerNumber: 1, flatNumber: 1 });

        // Filter by society if societyId provided
        // Since society is on the user object (usually), we filter in memory or we could aggregate
        // For now, simpler to filter in memory after populate, or assumes Order has society field.
        // User model has society field.

        const filteredOrders = societyId
            ? orders.filter(order => order.user?.society && order.user.society.toString() === societyId)
            : orders;

        res.json(filteredOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order status
// @route   PUT /api/vendors/orders/:id/status
// @access  Private/Vendor
router.put('/orders/:id/status', protect, vendor, async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.status === 'Delivered') {
                return res.status(400).json({ message: 'Order already delivered' });
            }

            order.status = status;
            if (status === 'Delivered') {
                order.deliveredAt = Date.now();
                // Update vendor earnings
                const vendorProfile = await Vendor.findById(order.vendor);
                vendorProfile.totalEarnings += order.totalAmount;
                await vendorProfile.save();
            }

            const updatedOrder = await order.save();

            // Notify User
            const Notification = require('../models/Notification');

            // Map status to notification type
            let notificationType = 'system';
            if (status === 'Accepted') notificationType = 'order_confirmed';
            else if (status === 'On The Way') notificationType = 'order_out_for_delivery';
            else if (status === 'Delivered') notificationType = 'order_delivered';
            else if (status === 'Cancelled') notificationType = 'order_cancelled';

            await Notification.createNotification({
                user: order.user,
                title: `Order ${status}`,
                message: `Your order for ${order.quantity} bottles is now ${status.toLowerCase()}.`,
                type: notificationType,
                relatedOrder: order._id
            });


            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle vendor active status
// @route   PUT /api/vendors/status
// @access  Private/Vendor
router.put('/status', protect, vendor, async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ user: req.user._id });
        if (vendorProfile) {
            vendorProfile.isActive = !vendorProfile.isActive;
            const updatedVendor = await vendorProfile.save();
            res.json(updatedVendor);
        } else {
            res.status(404).json({ message: 'Vendor profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
