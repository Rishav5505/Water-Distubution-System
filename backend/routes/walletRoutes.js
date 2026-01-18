const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const PrepaidPlan = require('../models/PrepaidPlan');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay (you'll need to set these in .env)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret',
});

// @desc    Get wallet balance and details
// @route   GET /api/wallet
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });

        // Create wallet if doesn't exist
        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0,
            });
        }

        res.json({
            success: true,
            wallet: {
                balance: wallet.balance,
                totalCredited: wallet.totalCredited,
                totalDebited: wallet.totalDebited,
                totalCashback: wallet.totalCashback,
                lastRechargeDate: wallet.lastRechargeDate,
                lastTransactionDate: wallet.lastTransactionDate,
                isActive: wallet.isActive,
            },
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wallet details',
        });
    }
});

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('relatedOrder', 'orderNumber quantity totalPrice')
            .populate('relatedSubscription', 'frequency quantity');

        const total = await Transaction.countDocuments({ user: req.user._id });

        res.json({
            success: true,
            transactions,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
        });
    }
});

// @desc    Get prepaid plans
// @route   GET /api/wallet/plans
// @access  Private
router.get('/plans', protect, async (req, res) => {
    try {
        const plans = await PrepaidPlan.find({ isActive: true }).sort({
            sortOrder: 1,
            amount: 1,
        });

        res.json({
            success: true,
            plans,
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prepaid plans',
        });
    }
});

// @desc    Create Razorpay order for wallet recharge
// @route   POST /api/wallet/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, planId } = req.body;

        if (!amount || amount < 10) {
            return res.status(400).json({
                success: false,
                message: 'Minimum recharge amount is ₹10',
            });
        }

        // Check if using a plan
        let bonusAmount = 0;
        if (planId) {
            const plan = await PrepaidPlan.findById(planId);
            if (plan && plan.isActive) {
                bonusAmount = plan.bonusAmount;
            }
        }

        // Create Razorpay order
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `wallet_${req.user._id}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                type: 'wallet_recharge',
                bonusAmount: bonusAmount,
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                bonusAmount: bonusAmount,
                totalCredit: amount + bonusAmount,
            },
            key: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
        });
    }
});

// @desc    Verify payment and add money to wallet
// @route   POST /api/wallet/verify-payment
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status !== 'captured' && payment.status !== 'authorized') {
            return res.status(400).json({
                success: false,
                message: 'Payment not successful',
            });
        }

        const amount = payment.amount / 100; // Convert from paise to rupees
        const bonusAmount = parseFloat(payment.notes?.bonusAmount || 0);
        const totalCredit = amount + bonusAmount;

        // Get or create wallet
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0,
            });
        }

        const balanceBefore = wallet.balance;

        // Credit amount to wallet
        wallet.creditAmount(amount, `Wallet recharge via ${payment.method}`);

        // Add bonus if any
        if (bonusAmount > 0) {
            wallet.addCashback(bonusAmount, 'Recharge bonus');
        }

        await wallet.save();

        // Create transaction record
        await Transaction.create({
            user: req.user._id,
            wallet: wallet._id,
            type: 'recharge',
            transactionType: 'credit',
            amount: totalCredit,
            balanceBefore: balanceBefore,
            balanceAfter: wallet.balance,
            status: 'completed',
            paymentMethod: payment.method,
            paymentGateway: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
            },
            description: `Wallet recharge of ₹${amount}${bonusAmount > 0 ? ` + ₹${bonusAmount} bonus` : ''}`,
        });

        res.json({
            success: true,
            message: 'Payment verified and wallet credited successfully',
            wallet: {
                balance: wallet.balance,
                credited: totalCredit,
            },
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
        });
    }
});

// @desc    Manual wallet recharge (for testing/admin)
// @route   POST /api/wallet/recharge
// @access  Private
router.post('/recharge', protect, async (req, res) => {
    try {
        const { amount, description } = req.body;

        if (!amount || amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        // Get or create wallet
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = await Wallet.create({
                user: req.user._id,
                balance: 0,
            });
        }

        const balanceBefore = wallet.balance;

        // Credit amount
        wallet.creditAmount(amount, description || 'Manual recharge');
        await wallet.save();

        // Create transaction
        await Transaction.create({
            user: req.user._id,
            wallet: wallet._id,
            type: 'recharge',
            transactionType: 'credit',
            amount: amount,
            balanceBefore: balanceBefore,
            balanceAfter: wallet.balance,
            status: 'completed',
            paymentMethod: 'cash',
            description: description || 'Manual wallet recharge',
        });

        res.json({
            success: true,
            message: 'Wallet recharged successfully',
            wallet: {
                balance: wallet.balance,
            },
        });
    } catch (error) {
        console.error('Error recharging wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recharge wallet',
        });
    }
});

module.exports = router;
