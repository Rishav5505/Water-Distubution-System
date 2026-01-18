import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connected, setConnected] = useState(false);

    // Initialize Socket.io connection
    useEffect(() => {
        if (!user || !user.token) {
            return;
        }

        const newSocket = io('http://localhost:5000', {
            auth: {
                token: user.token,
            },
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to notification server');
            setConnected(true);
        });

        newSocket.on('connected', (data) => {
            console.log('Server confirmed connection:', data);
            toast.success('🔔 Real-time notifications active!', {
                duration: 2000,
            });
        });

        newSocket.on('notification', (notification) => {
            console.log('📬 New notification received:', notification);

            // Add to notifications list
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            const notificationToast = () => (
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{notification.icon}</span>
                    <div>
                        <p className="font-bold text-white">{notification.title}</p>
                        <p className="text-sm text-slate-300">{notification.message}</p>
                    </div>
                </div>
            );

            if (notification.priority === 'urgent' || notification.priority === 'high') {
                toast.custom(notificationToast, {
                    duration: 5000,
                    style: {
                        background: '#1e293b',
                        border: '1px solid rgba(14, 165, 233, 0.3)',
                        padding: '16px',
                        borderRadius: '12px',
                    },
                });
            } else {
                toast.custom(notificationToast, {
                    duration: 3000,
                    style: {
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px',
                        borderRadius: '12px',
                    },
                });
            }

            // Browser notification
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/water-icon.png',
                    badge: '/water-icon.png',
                });
            }
        });

        newSocket.on('notification_read', ({ notificationId }) => {
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        });

        newSocket.on('all_notifications_read', () => {
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from notification server');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    // Request browser notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((notificationId) => {
        if (socket) {
            socket.emit('mark_read', notificationId);
        }
    }, [socket]);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        if (socket) {
            socket.emit('mark_all_read');
        }
    }, [socket]);

    const value = {
        socket,
        notifications,
        unreadCount,
        connected,
        markAsRead,
        markAllAsRead,
        setNotifications,
        setUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
