const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Notice = require('../models/Notice');
const WaterQuality = require('../models/WaterQuality');
const BottleReturn = require('../models/BottleReturn');
const ScheduledOrder = require('../models/ScheduledOrder');
const Complaint = require('../models/Complaint');
const UsageAnalytics = require('../models/UsageAnalytics');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { sendNotification, checkWalletBalance } = require('../utils/notifications');


// @desc    Place a new water order
// @route   POST /api/users/orders
// @access  Private
router.post('/orders', protect, async (req, res) => {
    const { quantity, vendorId, timeSlot, paymentMode } = req.body;

    try {
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const totalAmount = quantity * vendor.pricePerBottle;

        // Handle wallet payment
        let paymentStatus = 'Pending';
        let walletPayment = false;

        if (paymentMode === 'wallet') {
            // Get or create wallet
            let wallet = await Wallet.findOne({ user: req.user._id });

            if (!wallet) {
                wallet = await Wallet.create({
                    user: req.user._id,
                    balance: 0,
                });
            }

            // Check sufficient balance
            if (!wallet.hasSufficientBalance(totalAmount)) {
                return res.status(400).json({
                    message: `Insufficient wallet balance. Required: ₹${totalAmount}, Available: ₹${wallet.balance}`,
                    walletBalance: wallet.balance,
                    requiredAmount: totalAmount,
                });
            }

            // Deduct from wallet
            const balanceBefore = wallet.balance;
            wallet.debitAmount(totalAmount, `Order payment for ${quantity} bottles`);
            await wallet.save();

            // Create transaction record
            await Transaction.create({
                user: req.user._id,
                wallet: wallet._id,
                type: 'order',
                transactionType: 'debit',
                amount: totalAmount,
                balanceBefore: balanceBefore,
                balanceAfter: wallet.balance,
                status: 'completed',
                paymentMethod: 'wallet',
                description: `Order payment for ${quantity} bottles from ${vendor.vendorName}`,
            });

            paymentStatus = 'Paid';
            walletPayment = true;
        }

        // Create order
        const order = await Order.create({
            user: req.user._id,
            vendor: vendorId,
            towerNumber: req.user.towerNumber,
            flatNumber: req.user.flatNumber,
            quantity,
            totalAmount,
            status: 'Pending',
            paymentStatus: paymentStatus,
            paymentMode: paymentMode || 'COD',
            timeSlot
        });

        // Award loyalty points: 1 point per 50 spent
        const user = await User.findById(req.user._id);
        if (user) {
            const pointsEarned = Math.floor(totalAmount / 50);
            user.loyaltyPoints += pointsEarned;
            await user.save();

            // If wallet payment, give 2% cashback for orders above ₹100
            if (walletPayment && totalAmount >= 100) {
                const cashbackAmount = Math.floor(totalAmount * 0.02);
                const wallet = await Wallet.findOne({ user: req.user._id });

                if (wallet && cashbackAmount > 0) {
                    const balanceBefore = wallet.balance;
                    wallet.addCashback(cashbackAmount, `2% cashback on order #${order._id}`);
                    await wallet.save();

                    // Create cashback transaction
                    await Transaction.create({
                        user: req.user._id,
                        wallet: wallet._id,
                        type: 'cashback',
                        transactionType: 'credit',
                        amount: cashbackAmount,
                        balanceBefore: balanceBefore,
                        balanceAfter: wallet.balance,
                        status: 'completed',
                        relatedOrder: order._id,
                        description: `2% cashback on order of ₹${totalAmount}`,
                    });
                }
            }
        }

        // Populate vendor details before sending response
        await order.populate({ path: 'vendor', select: 'vendorName' });


        // Send order placed notification
        await sendNotification(req.user._id, 'order_placed', order);

        // Send cashback notification if applicable
        if (walletPayment && totalAmount >= 100) {
            const cashbackAmount = Math.floor(totalAmount * 0.02);
            await sendNotification(req.user._id, 'cashback_credited', {
                amount: cashbackAmount,
                orderId: order._id
            });
        }

        // Check wallet balance after order and send alert if low
        if (walletPayment) {
            const finalWallet = await Wallet.findOne({ user: req.user._id });
            await checkWalletBalance(req.user._id, finalWallet.balance);
        }

        res.status(201).json({
            success: true,
            order,
            message: walletPayment
                ? `Order placed successfully! Paid via wallet. ${totalAmount >= 100 ? '2% cashback credited!' : ''}`
                : 'Order placed successfully!',
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get society notices
// @route   GET /api/users/notices
// @access  Private
router.get('/notices', protect, async (req, res) => {
    try {
        // filter by user's society if needed
        const notices = await Notice.find({
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get water quality reports
// @route   GET /api/users/water-quality
// @access  Private
router.get('/water-quality', protect, async (req, res) => {
    try {
        const reports = await WaterQuality.find().sort({ testedAt: -1 }).limit(5);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user referral details
// @route   GET /api/users/referral
// @access  Private
router.get('/referral', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.referralCode) {
            user.referralCode = 'WATER' + Math.random().toString(36).substring(2, 7).toUpperCase();
            await user.save();
        }
        const referralsCount = await User.countDocuments({ referredBy: req.user._id });
        res.json({
            referralCode: user.referralCode,
            loyaltyPoints: user.loyaltyPoints,
            referralsCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user order history
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({
                path: 'vendor',
                select: 'vendorName user'
            })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all active vendors
// @route   GET /api/users/vendors
// @access  Private
router.get('/vendors', protect, async (req, res) => {
    try {
        const vendors = await Vendor.find({ isActive: true }).populate('user', '_id');
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.towerNumber = req.body.towerNumber || user.towerNumber;
            user.flatNumber = req.body.flatNumber || user.flatNumber;
            user.preferredVendor = req.body.preferredVendor || user.preferredVendor;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                towerNumber: updatedUser.towerNumber,
                flatNumber: updatedUser.flatNumber,
                token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== BOTTLE RETURN ROUTES ====================

// @desc    Request bottle return
// @route   POST /api/users/bottle-returns
// @access  Private
router.post('/bottle-returns', protect, async (req, res) => {
    try {
        const { orderId, quantityReturned, notes } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const bottleReturn = await BottleReturn.create({
            user: req.user._id,
            vendor: order.vendor,
            order: orderId,
            quantityReturned,
            depositRefund: quantityReturned * 10, // ₹10 per bottle deposit
            notes
        });

        res.status(201).json(bottleReturn);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user's bottle returns
// @route   GET /api/users/bottle-returns
// @access  Private
router.get('/bottle-returns', protect, async (req, res) => {
    try {
        const returns = await BottleReturn.find({ user: req.user._id })
            .populate('vendor', 'vendorName')
            .populate('order')
            .sort({ createdAt: -1 });
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== SCHEDULED ORDER ROUTES ====================

// @desc    Create scheduled order
// @route   POST /api/users/scheduled-orders
// @access  Private
router.post('/scheduled-orders', protect, async (req, res) => {
    try {
        const { vendorId, quantity, scheduledDate, timeSlot, recurring, frequency, notes } = req.body;

        const scheduledOrder = await ScheduledOrder.create({
            user: req.user._id,
            vendor: vendorId,
            quantity,
            scheduledDate,
            timeSlot,
            recurring: recurring || false,
            frequency: frequency || 'None',
            notes
        });

        res.status(201).json(scheduledOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user's scheduled orders
// @route   GET /api/users/scheduled-orders
// @access  Private
router.get('/scheduled-orders', protect, async (req, res) => {
    try {
        const scheduled = await ScheduledOrder.find({
            user: req.user._id,
            status: { $ne: 'Cancelled' }
        })
            .populate('vendor', 'vendorName pricePerBottle')
            .sort({ scheduledDate: 1 });
        res.json(scheduled);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Cancel scheduled order
// @route   PUT /api/users/scheduled-orders/:id/cancel
// @access  Private
router.put('/scheduled-orders/:id/cancel', protect, async (req, res) => {
    try {
        const scheduledOrder = await ScheduledOrder.findById(req.params.id);

        if (!scheduledOrder) {
            return res.status(404).json({ message: 'Scheduled order not found' });
        }

        if (scheduledOrder.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        scheduledOrder.status = 'Cancelled';
        await scheduledOrder.save();

        res.json(scheduledOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== COMPLAINT ROUTES ====================

// @desc    Submit complaint
// @route   POST /api/users/complaints
// @access  Private
router.post('/complaints', protect, async (req, res) => {
    try {
        const { vendorId, orderId, category, message } = req.body;

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

// @desc    Get user's complaints
// @route   GET /api/users/complaints
// @access  Private
router.get('/complaints', protect, async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user._id })
            .populate('vendor', 'vendorName')
            .populate('order')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==================== USAGE ANALYTICS ROUTES ====================

// @desc    Get user's usage analytics
// @route   GET /api/users/analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
    try {
        let analytics = await UsageAnalytics.findOne({ user: req.user._id });

        // If no analytics exist, create initial record
        if (!analytics) {
            analytics = await UsageAnalytics.create({ user: req.user._id });
        }

        // Calculate real-time stats from orders
        const orders = await Order.find({
            user: req.user._id,
            status: 'Delivered'
        });

        const totalBottles = orders.reduce((sum, order) => sum + order.quantity, 0);
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Update analytics
        analytics.totalLifetimeBottles = totalBottles;
        analytics.totalLifetimeSpent = totalSpent;
        analytics.lastUpdated = Date.now();

        // Calculate monthly breakdown
        const monthlyData = {};
        orders.forEach(order => {
            const month = new Date(order.createdAt).toISOString().substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { month, totalBottles: 0, totalSpent: 0, orderCount: 0 };
            }
            monthlyData[month].totalBottles += order.quantity;
            monthlyData[month].totalSpent += order.totalAmount;
            monthlyData[month].orderCount += 1;
        });

        analytics.monthlyUsage = Object.values(monthlyData).map(m => ({
            ...m,
            averageOrderSize: m.totalBottles / m.orderCount
        }));

        // Calculate average monthly consumption
        const monthCount = analytics.monthlyUsage.length || 1;
        analytics.averageMonthlyConsumption = totalBottles / monthCount;

        await analytics.save();

        // Get society average for comparison
        const societyOrders = await Order.find({ status: 'Delivered' });
        const societyAverage = societyOrders.length > 0
            ? societyOrders.reduce((sum, o) => sum + o.quantity, 0) / societyOrders.length
            : 0;

        res.json({
            ...analytics.toObject(),
            societyAverage,
            comparisonPercentage: societyAverage > 0
                ? ((analytics.averageMonthlyConsumption - societyAverage) / societyAverage * 100).toFixed(1)
                : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Toggle Vacation Mode
// @route   POST /api/users/vacation
// @access  Private
router.post('/vacation', protect, async (req, res) => {
    try {
        const { isActive, startDate, endDate } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.vacationMode = {
            isActive: isActive,
            startDate: isActive ? startDate : null,
            endDate: isActive ? endDate : null
        };

        if (isActive) {
            // Logic to pause subscriptions can be added here
            // For now we just mark the status
        }

        await user.save();
        res.json({
            success: true,
            message: isActive ? `Vacation mode ON from ${new Date(startDate).toLocaleDateString()}` : 'Vacation mode OFF',
            vacationMode: user.vacationMode
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const { generateInvoicePDF } = require('../utils/invoiceGenerator');

// ==================== INVOICE ROUTES ====================

// @desc    Download monthly invoice PDF
// @route   GET /api/users/invoice/:month/:year
// @access  Private
router.get('/invoice/:month/:year', protect, async (req, res) => {
    try {
        const { month, year } = req.params;
        const user = await User.findById(req.user._id);

        // Define start and end dates for the month
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthIndex = monthNames.indexOf(month);

        if (monthIndex === -1) {
            return res.status(400).json({ message: 'Invalid month' });
        }

        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

        // Find delivered orders in this range
        const orders = await Order.find({
            user: req.user._id,
            status: 'Delivered',
            createdAt: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: 1 });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this period' });
        }

        const pdfBuffer = await generateInvoicePDF(user, orders, month, year);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${month}_${year}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Invoice generation error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

