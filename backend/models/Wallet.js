const mongoose = require('mongoose');

const walletSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        totalCredited: {
            type: Number,
            default: 0,
        },
        totalDebited: {
            type: Number,
            default: 0,
        },
        totalCashback: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastRechargeDate: Date,
        lastTransactionDate: Date,
        // Keep old transactions for backward compatibility
        transactions: [
            {
                amount: Number,
                type: {
                    type: String,
                    enum: ['Credit', 'Debit'],
                },
                description: String,
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Method to check sufficient balance
walletSchema.methods.hasSufficientBalance = function (amount) {
    return this.balance >= amount;
};

// Method to add money
walletSchema.methods.creditAmount = function (amount, description = 'Wallet Recharge') {
    this.balance += amount;
    this.totalCredited += amount;
    this.lastRechargeDate = new Date();
    this.lastTransactionDate = new Date();

    this.transactions.push({
        amount,
        type: 'Credit',
        description,
        date: new Date(),
    });

    return this;
};

// Method to deduct money
walletSchema.methods.debitAmount = function (amount, description = 'Order Payment') {
    if (this.balance < amount) {
        throw new Error('Insufficient wallet balance');
    }

    this.balance -= amount;
    this.totalDebited += amount;
    this.lastTransactionDate = new Date();

    this.transactions.push({
        amount,
        type: 'Debit',
        description,
        date: new Date(),
    });

    return this;
};

// Method to add cashback
walletSchema.methods.addCashback = function (amount, description = 'Cashback Reward') {
    this.balance += amount;
    this.totalCredited += amount;
    this.totalCashback += amount;
    this.lastTransactionDate = new Date();

    this.transactions.push({
        amount,
        type: 'Credit',
        description,
        date: new Date(),
    });

    return this;
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
