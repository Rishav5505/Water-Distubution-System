const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = { user: req.user._id };

        // Filter by read status if specified
        if (req.query.unread === 'true') {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('relatedOrder', 'quantity totalAmount status')
            .populate('relatedTransaction', 'amount type');

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        await notification.markAsRead();

        res.json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification',
        });
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notifications',
        });
    }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        await notification.deleteOne();

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
        });
    }
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            isRead: false,
        });

        res.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
        });
    }
});

module.exports = router;
