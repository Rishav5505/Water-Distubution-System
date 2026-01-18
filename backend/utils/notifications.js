const Notification = require('../models/Notification');

// Notification templates
const notificationTemplates = {
    order_placed: (order) => ({
        type: 'order_placed',
        title: '🎉 Order Placed Successfully!',
        message: `Your order for ${order.quantity} bottles has been placed. Total: ₹${order.totalAmount}`,
        icon: '🛒',
        priority: 'medium',
        actionUrl: '/dashboard',
        actionLabel: 'View Orders',
    }),

    order_confirmed: (order) => ({
        type: 'order_confirmed',
        title: '✅ Order Confirmed!',
        message: `Your order #${order._id.toString().slice(-6)} has been confirmed by the vendor.`,
        icon: '✅',
        priority: 'high',
        actionUrl: '/dashboard',
        actionLabel: 'Track Order',
    }),

    order_out_for_delivery: (order) => ({
        type: 'order_out_for_delivery',
        title: '🚚 Out for Delivery!',
        message: `Your ${order.quantity} bottles are on the way! Expected soon.`,
        icon: '🚚',
        priority: 'high',
        actionUrl: '/dashboard',
        actionLabel: 'Track Order',
    }),

    order_delivered: (order) => ({
        type: 'order_delivered',
        title: '🎊 Order Delivered!',
        message: `Your order of ${order.quantity} bottles has been delivered successfully!`,
        icon: '🎊',
        priority: 'medium',
        actionUrl: '/dashboard',
        actionLabel: 'View Order',
    }),

    order_cancelled: (order) => ({
        type: 'order_cancelled',
        title: '❌ Order Cancelled',
        message: `Your order #${order._id.toString().slice(-6)} has been cancelled.`,
        icon: '❌',
        priority: 'medium',
        actionUrl: '/dashboard',
        actionLabel: 'View Details',
    }),

    wallet_low_balance: (balance, threshold = 100) => ({
        type: 'wallet_low_balance',
        title: '⚠️ Low Wallet Balance',
        message: `Your wallet balance is ₹${balance}. Recharge now to continue enjoying instant orders!`,
        icon: '💳',
        priority: 'high',
        actionUrl: '/wallet',
        actionLabel: 'Recharge Wallet',
    }),

    wallet_recharged: (amount, bonus = 0) => ({
        type: 'wallet_recharged',
        title: '💰 Wallet Recharged!',
        message: `₹${amount} added to your wallet${bonus > 0 ? ` + ₹${bonus} bonus!` : '!'}`,
        icon: '💰',
        priority: 'medium',
        actionUrl: '/wallet',
        actionLabel: 'View Wallet',
    }),

    cashback_credited: (amount, orderId) => ({
        type: 'cashback_credited',
        title: '🎁 Cashback Credited!',
        message: `Congratulations! ₹${amount} cashback has been added to your wallet!`,
        icon: '🎁',
        priority: 'medium',
        actionUrl: '/wallet',
        actionLabel: 'View Wallet',
    }),

    scheduled_reminder: (scheduledOrder) => ({
        type: 'scheduled_reminder',
        title: '📅 Scheduled Order Reminder',
        message: `Your scheduled order for ${scheduledOrder.quantity} bottles is tomorrow!`,
        icon: '📅',
        priority: 'medium',
        actionUrl: '/dashboard',
        actionLabel: 'View Schedule',
    }),

    complaint_resolved: (complaint) => ({
        type: 'complaint_resolved',
        title: '✅ Complaint Resolved',
        message: `Your complaint has been resolved. Thank you for your patience!`,
        icon: '✅',
        priority: 'high',
        actionUrl: '/dashboard',
        actionLabel: 'View Details',
    }),

    promotional: (title, message) => ({
        type: 'promotional',
        title: title,
        message: message,
        icon: '🎉',
        priority: 'low',
    }),
};

// Send notification to user
const sendNotification = async (userId, template, data = {}) => {
    try {
        let notificationData;

        if (typeof template === 'string' && notificationTemplates[template]) {
            notificationData = notificationTemplates[template](data);
        } else {
            notificationData = template;
        }

        const notification = await Notification.createNotification({
            user: userId,
            ...notificationData,
            relatedOrder: data.orderId || data._id,
            relatedTransaction: data.transactionId,
            metadata: data.metadata || {},
        });

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
};

// Send to multiple users
const sendBulkNotification = async (userIds, template, data = {}) => {
    try {
        const promises = userIds.map(userId =>
            sendNotification(userId, template, data)
        );

        return await Promise.all(promises);
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        return [];
    }
};

// Check wallet balance and send alert if low
const checkWalletBalance = async (userId, currentBalance, threshold = 100) => {
    if (currentBalance < threshold && currentBalance >= 0) {
        await sendNotification(
            userId,
            'wallet_low_balance',
            { balance: currentBalance, threshold }
        );
    }
};

module.exports = {
    sendNotification,
    sendBulkNotification,
    checkWalletBalance,
    notificationTemplates,
};
