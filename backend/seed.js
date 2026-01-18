const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Wallet = require('./models/Wallet');
const Society = require('./models/Society');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Vendor.deleteMany();
        await Wallet.deleteMany();
        await Society.deleteMany();

        console.log('Existing data cleared.');

        // 0. Create Societies
        const societies = await Society.create([
            { name: 'Central Park Flower Valley', address: 'Sector 32/33', city: 'Sohna', pincode: '122103', latitude: 28.2450, longitude: 77.0700 },
            { name: 'Signature Global Park', address: 'Sector 36', city: 'Sohna', pincode: '122103', latitude: 28.2390, longitude: 77.0650 },
            { name: 'Eldeco Accolade', address: 'Sector 2', city: 'Sohna', pincode: '122103', latitude: 28.2500, longitude: 77.0600 },
            { name: 'Ashiana Anmol', address: 'Sector 33', city: 'Sohna', pincode: '122103', latitude: 28.2400, longitude: 77.0720 },
            { name: 'Godrej Nature Plus', address: 'Sector 33', city: 'Sohna', pincode: '122103', latitude: 28.2420, longitude: 77.0750 },
            { name: 'Breez Global Heights', address: 'Sector 33', city: 'Sohna', pincode: '122103', latitude: 28.2440, longitude: 77.0780 },
            { name: 'GLS Arawali Homes', address: 'Sector 4', city: 'Sohna', pincode: '122103', latitude: 28.2350, longitude: 77.0550 },
            { name: 'Meffier Garden Residency', address: 'Sector 5', city: 'Sohna', pincode: '122103', latitude: 28.2300, longitude: 77.0500 },
            { name: 'HCBS Sports Ville', address: 'Sector 35', city: 'Sohna', pincode: '122103', latitude: 28.2380, longitude: 77.0620 },
            { name: 'Ganga Realty Tathastu', address: 'Sector 35', city: 'Sohna', pincode: '122103', latitude: 28.2370, longitude: 77.0630 },
            { name: 'Global Heights Apartment', address: 'Main Road', city: 'Gurgaon', pincode: '122001', latitude: 28.4595, longitude: 77.0266 }
        ]);
        console.log('Societies created');

        // 1. Create Admin
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@jalconnect.com',
            password: 'admin123',
            role: 'admin',
        });
        console.log('Admin User Created: admin@jalconnect.com / admin123');

        // 2. Create Vendors
        const vendorUsers = [
            { name: 'ABC Water Services', email: 'abc@vendor.com', password: 'vendor123', role: 'vendor' },
            { name: 'Fresh Blue Waters', email: 'blue@vendor.com', password: 'vendor123', role: 'vendor' }
        ];

        for (const v of vendorUsers) {
            const user = await User.create(v);
            await Vendor.create({
                user: user._id,
                vendorName: v.name,
                pricePerBottle: 30,
                isActive: true
            });
            console.log(`Vendor Created: ${v.email} / ${v.password}`);
        }

        // 3. Create a Residents
        const residents = [
            { name: 'Rishabh Dev', email: 'rishabh@user.com', password: 'user123', towerNumber: 'A', flatNumber: '101', role: 'user' },
            { name: 'John Doe', email: 'john@user.com', password: 'user123', towerNumber: 'B', flatNumber: '505', role: 'user' }
        ];

        for (const r of residents) {
            const user = await User.create(r);
            await Wallet.create({ user: user._id, balance: 500 });
            console.log(`Resident Created: ${r.email} / ${r.password}`);
        }

        console.log('Seeding Completed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with seeding: ${error.message}`);
        process.exit(1);
    }
};

seedData();
