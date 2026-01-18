const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        society: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Society',
        },
        month: {
            type: String, // e.g. "January 2026"
            required: true,
        },
        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order',
            }
        ],
        totalBottles: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        tax: {
            type: Number,
            default: 0,
        },
        grandTotal: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Unpaid', 'Paid'],
            default: 'Unpaid',
        },
        pdfUrl: {
            type: String, // Path to generated PDF
        }
    },
    {
        timestamps: true,
    }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
