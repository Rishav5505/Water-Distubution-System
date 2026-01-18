const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/:userId
// @access  Private
router.get('/:otherUserId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.otherUserId },
                { sender: req.params.otherUserId, receiver: req.user._id },
            ],
        }).sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { sender: req.params.otherUserId, receiver: req.user._id, isRead: false },
            { isRead: true, readAt: Date.now() }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content,
        });

        const populatedMessage = await message.populate('sender', 'name');

        // Emit via Socket.io if globally available
        if (global.io) {
            global.io.to(receiverId).emit('new_message', populatedMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get list of conversations (recent users chatted with)
// @route   GET /api/chat/conversations
// @access  Private
router.get('/list/conversations', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find unique users this user has chatted with
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        const conversationIds = new Set();
        const conversations = [];

        for (const msg of messages) {
            const otherUser = msg.sender.equals(userId) ? msg.receiver : msg.sender;
            if (!conversationIds.has(otherUser.toString())) {
                conversationIds.add(otherUser.toString());
                const userDetails = await User.findById(otherUser).select('name role towerNumber flatNumber');
                conversations.push({
                    user: userDetails,
                    lastMessage: msg.content,
                    lastMessageDate: msg.createdAt,
                    unreadCount: await Message.countDocuments({
                        sender: otherUser,
                        receiver: userId,
                        isRead: false
                    })
                });
            }
        }

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
