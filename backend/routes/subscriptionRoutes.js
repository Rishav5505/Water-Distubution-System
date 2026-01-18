const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
router.post('/', protect, async (req, res) => {
    const { vendorId, quantity, frequency, customDays } = req.body;
    try {
        const subscription = await Subscription.create({
            user: req.user._id,
            vendor: vendorId,
            quantity,
            frequency,
            customDays,
        });

        await Notification.create({
            user: req.user._id,
            title: 'Subscription Started',
            message: `Your ${frequency} water delivery subscription has been activated.`,
            type: 'Subscription'
        });

        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id }).populate('vendor', 'vendorName pricePerBottle');
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update subscription (Pause/Resume/Cancel)
// @route   PUT /api/subscriptions/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        subscription.status = req.body.status || subscription.status;
        const updated = await subscription.save();

        await Notification.create({
            user: req.user._id,
            title: 'Subscription Updated',
            message: `Your subscription status is now: ${subscription.status}`,
            type: 'Subscription'
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Simulate daily subscription order generation (for demo/viva)
// @route   POST /api/subscriptions/process-daily
// @access  Private/Admin
router.post('/process-daily', protect, async (req, res) => {
    try {
        const today = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = dayNames[today.getDay()];

        const activeSubscriptions = await Subscription.find({ status: 'Active' }).populate('user vendor');
        let generatedCount = 0;

        for (const sub of activeSubscriptions) {
            let shouldGenerate = false;
            if (sub.frequency === 'Daily') shouldGenerate = true;
            else if (sub.frequency === 'Mon-Sat' && currentDay !== 'Sunday') shouldGenerate = true;
            else if (sub.frequency === 'Custom' && sub.customDays.includes(currentDay)) shouldGenerate = true;

            if (shouldGenerate) {
                // Check if already generated today
                if (!sub.lastGeneratedDate || sub.lastGeneratedDate.toDateString() !== today.toDateString()) {
                    await Order.create({
                        user: sub.user._id,
                        vendor: sub.vendor._id,
                        towerNumber: sub.user.towerNumber,
                        flatNumber: sub.user.flatNumber,
                        quantity: sub.quantity,
                        totalAmount: sub.quantity * sub.vendor.pricePerBottle,
                        status: 'Pending',
                        orderType: 'Subscription'
                    });

                    sub.lastGeneratedDate = today;
                    await sub.save();
                    generatedCount++;
                }
            }
        }
        res.json({ message: `Processed orders: ${generatedCount}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
