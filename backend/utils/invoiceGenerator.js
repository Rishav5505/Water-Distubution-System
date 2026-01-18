const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (user, orders, month, year) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header - Business Details
            doc.fillColor('#0EA5E9').fontSize(25).text('JalConnect', 50, 50, { align: 'left' });
            doc.fillColor('#475569').fontSize(10).text('Your Smart Water Delivery Partner', 50, 80);

            doc.fillColor('#1E293B').fontSize(18).text('MONTHLY INVOICE', 0, 55, { align: 'right' });
            doc.fontSize(10).text(`Bill Date: ${new Date().toLocaleDateString()}`, 0, 80, { align: 'right' });
            doc.text(`Billing Period: ${month} ${year}`, 0, 95, { align: 'right' });

            doc.moveDown(2);
            doc.rect(50, 120, 500, 2).fill('#E2E8F0');

            // Billing Details
            doc.moveDown(2);
            doc.fillColor('#64748B').fontSize(10).text('BILLED TO:', 50, 140);
            doc.fillColor('#1E293B').fontSize(12).font('Helvetica-Bold').text(user.name, 50, 155);
            doc.font('Helvetica').fontSize(10).text(`Tower: ${user.towerNumber}, Flat: ${user.flatNumber}`, 50, 172);
            doc.text(`Email: ${user.email}`, 50, 187);

            // Invoice Summary Table Header
            doc.moveDown(3);
            const tableTop = 230;
            doc.rect(50, tableTop, 500, 25).fill('#F8FAFC');
            doc.fillColor('#475569').font('Helvetica-Bold').fontSize(10);
            doc.text('Date', 60, tableTop + 8);
            doc.text('Description', 150, tableTop + 8);
            doc.text('Quantity', 350, tableTop + 8, { width: 60, align: 'center' });
            doc.text('Amount', 450, tableTop + 8, { width: 90, align: 'right' });

            // Table Rows
            let currentY = tableTop + 30;
            let totalAmount = 0;
            let totalBottles = 0;

            doc.font('Helvetica').fontSize(9).fillColor('#1E293B');

            orders.forEach((order) => {
                doc.text(new Date(order.createdAt).toLocaleDateString(), 60, currentY);
                doc.text(`${order.quantity} x 20L Water Bottle`, 150, currentY);
                doc.text(order.quantity.toString(), 350, currentY, { width: 60, align: 'center' });
                doc.text(`₹${order.totalAmount}`, 450, currentY, { width: 90, align: 'right' });

                totalAmount += order.totalAmount;
                totalBottles += order.quantity;
                currentY += 20;

                // Page break check
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }
            });

            // Summary Section
            doc.moveDown(2);
            doc.rect(50, currentY, 500, 2).fill('#E2E8F0');
            currentY += 15;

            doc.fillColor('#64748B').fontSize(12).text('Total Bottles:', 300, currentY);
            doc.fillColor('#1E293B').font('Helvetica-Bold').text(totalBottles.toString(), 450, currentY, { align: 'right' });

            currentY += 20;
            doc.fillColor('#0EA5E9').fontSize(16).text('GRAND TOTAL:', 300, currentY);
            doc.text(`₹${totalAmount}`, 450, currentY, { align: 'right' });

            // Footer
            doc.fillColor('#94A3B8').fontSize(8)
                .text('Thank you for choosing JalConnect. For any billing queries, please contact support@jalconnect.com',
                    0, 750, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };
