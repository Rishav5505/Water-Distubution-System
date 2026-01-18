const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'order_placed',
                'order_confirmed',
                'order_out_for_delivery',
                'order_delivered',
                'order_cancelled',
                'wallet_low_balance',
                'wallet_recharged',
                'cashback_credited',
                'scheduled_reminder',
                'vendor_nearby',
                'complaint_resolved',
                'promotional',
                'system',
            ],
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: '🔔',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        relatedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        relatedTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
        },
        actionUrl: {
            type: String,
        },
        actionLabel: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

// Mark as read method
notificationSchema.methods.markAsRead = async function () {
    this.isRead = true;
    this.readAt = new Date();
    return await this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (notificationData) {
    const notification = await this.create(notificationData);

    // Emit socket event (will be handled by socket.io)
    if (global.io) {
        global.io.to(notificationData.user.toString()).emit('notification', notification);
    }

    return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
