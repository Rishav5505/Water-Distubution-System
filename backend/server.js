const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const { setupCronJobs } = require('./utils/cronJobs');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Setup Scheduled Tasks
setupCronJobs();


const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Make io globally accessible for notifications
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Socket.io authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room for targeted notifications
    socket.join(socket.userId);

    // Send connection success
    socket.emit('connected', {
        message: 'Successfully connected to notification server',
        userId: socket.userId
    });

    // Handle marking notification as read
    socket.on('mark_read', async (notificationId) => {
        try {
            const Notification = require('./models/Notification');
            const notification = await Notification.findById(notificationId);

            if (notification && notification.user.toString() === socket.userId) {
                await notification.markAsRead();
                socket.emit('notification_read', { notificationId });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    });

    // Handle mark all as read
    socket.on('mark_all_read', async () => {
        try {
            const Notification = require('./models/Notification');
            await Notification.updateMany(
                { user: socket.userId, isRead: false },
                { isRead: true, readAt: new Date() }
            );
            socket.emit('all_notifications_read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.userId}`);
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/features', require('./routes/featureRoutes'));
app.use('/api/enterprise', require('./routes/enterpriseRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));


// Root route
app.get('/', (req, res) => {
    res.send('JalConnect API is running with Real-time Notifications! 🔔');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 Socket.io server is ready for real-time notifications`);
});
