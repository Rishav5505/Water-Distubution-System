const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Wallet = require('../models/Wallet');
const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');

// ================= WALLET =================

router.get('/wallet', protect, async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) wallet = await Wallet.create({ user: req.user._id, balance: 100 }); // Bonus link
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/wallet/topup', protect, async (req, res) => {
    const { amount } = req.body;
    try {
        const wallet = await Wallet.findOne({ user: req.user._id });
        wallet.balance += amount;
        wallet.transactions.push({ amount, type: 'Credit', description: 'Wallet Top-up' });
        await wallet.save();
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= REPEAT ORDER =================

router.post('/repeat-order', protect, async (req, res) => {
    try {
        const lastOrder = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        if (!lastOrder) return res.status(404).json({ message: 'No previous order found' });

        const newOrder = await Order.create({
            user: req.user._id,
            vendor: lastOrder.vendor,
            towerNumber: lastOrder.towerNumber,
            flatNumber: lastOrder.flatNumber,
            quantity: lastOrder.quantity,
            totalAmount: lastOrder.totalAmount,
            status: 'Pending',
            orderType: 'One-time'
        });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= COMPLAINTS & FEEDBACK =================

router.post('/complaint', protect, async (req, res) => {
    const { vendorId, orderId, category, message } = req.body;
    try {
        const complaint = await Complaint.create({
            user: req.user._id,
            vendor: vendorId,
            order: orderId,
            category,
            message
        });
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/rating', protect, async (req, res) => {
    const { vendorId, orderId, rating, comment } = req.body;
    try {
        const rate = await Rating.create({
            user: req.user._id,
            vendor: vendorId,
            order: orderId,
            rating,
            comment
        });
        res.status(201).json(rate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ================= NOTIFICATIONS =================

router.get('/notifications', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/notifications/:id/read', protect, async (req, res) => {
    try {
        const note = await Notification.findById(req.params.id);
        if (note) {
            note.isRead = true;
            await note.save();
        }
        res.json({ message: 'Read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
