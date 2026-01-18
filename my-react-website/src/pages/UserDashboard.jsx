import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    ShoppingCart, Clock, History, Droplet, CheckCircle,
    Package, ArrowRight, Wallet, Calendar, Bell,
    Repeat, Star, MessageSquare, ShieldAlert,
    Loader2, Play, Pause, XCircle, Truck, MapPin,
    Recycle, CalendarPlus, AlertCircle, BarChart3,
    TrendingUp, TrendingDown, Award, Gift, Users, Sparkles, RefreshCw, DollarSign, MessageCircle
} from 'lucide-react';


import { motion, AnimatePresence } from 'framer-motion';
import { BottleReturnModal, ScheduleOrderModal, ComplaintModal, WalletTopupModal } from '../components/UserModals';
import ChatBox from '../components/ChatBox';


// Load Razorpay Script
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};



const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [orders, setOrders] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for new features
    const [activeTab, setActiveTab] = useState('orders'); // orders, subscriptions, wallet, returns, scheduled, complaints, analytics
    const [quantity, setQuantity] = useState(1);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState(null);
    const [timeSlot, setTimeSlot] = useState('06:00 AM - 09:00 AM');
    const [invoices, setInvoices] = useState([]);
    const [usageAlert, setUsageAlert] = useState(false);

    // New feature states
    const [bottleReturns, setBottleReturns] = useState([]);
    const [scheduledOrders, setScheduledOrders] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [referralData, setReferralData] = useState(null);
    const [prepaidPlans, setPrepaidPlans] = useState([]);
    const [transactions, setTransactions] = useState([]);


    // Modal states
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
    const [selectedOrderForComplaint, setSelectedOrderForComplaint] = useState(null);
    const [activeChat, setActiveChat] = useState(null); // { id, name }


    const API_URL = 'http://localhost:5000/api';
    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    // Vacation Mode State
    const [vacationMode, setVacationMode] = useState(false);
    const [vacationDates, setVacationDates] = useState({ start: '', end: '' });
    const [showVacationModal, setShowVacationModal] = useState(false);

    useEffect(() => {
        if (user?.token) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user?.token) return;
        try {
            const [
                vendorsRes,
                ordersRes,
                subsRes,
                notesRes,
                returnsRes,
                scheduledRes,
                complaintsRes,
                analyticsRes,
                referralRes,
                profileRes,
                walletRes,
                transactionsRes,
                plansRes
            ] = await Promise.all([
                axios.get(`${API_URL}/users/vendors`, config),
                axios.get(`${API_URL}/users/orders`, config),
                axios.get(`${API_URL}/subscriptions`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/features/notifications`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/users/bottle-returns`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/users/scheduled-orders`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/users/complaints`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/users/analytics`, config).catch(() => ({ data: null })),
                axios.get(`${API_URL}/users/referral`, config).catch(() => ({ data: null })),
                axios.get(`${API_URL}/users/profile`, config).catch(() => ({ data: {} })),
                axios.get(`${API_URL}/wallet`, config).catch(() => ({ data: { wallet: { balance: 0 } } })),
                axios.get(`${API_URL}/wallet/transactions`, config).catch(() => ({ data: { transactions: [] } })),
                axios.get(`${API_URL}/wallet/plans`, config).catch(() => ({ data: { plans: [] } }))
            ]);


            setVendors(vendorsRes.data);
            setOrders(ordersRes.data);
            setSubscriptions(subsRes.data);
            setWallet(walletRes.data.wallet || walletRes.data);
            setTransactions(transactionsRes.data.transactions || []);
            setPrepaidPlans(plansRes.data.plans || []);
            setNotifications(notesRes.data);
            setBottleReturns(returnsRes.data);
            setScheduledOrders(scheduledRes.data);
            setComplaints(complaintsRes.data);
            setAnalytics(analyticsRes.data);
            setReferralData(referralRes.data);


            // Set Vacation Mode from Profile Response
            const profile = profileRes.data;
            if (profile && profile.vacationMode?.isActive) {
                setVacationMode(true);
                setVacationDates({
                    start: profile.vacationMode.startDate ? new Date(profile.vacationMode.startDate).toISOString().split('T')[0] : '',
                    end: profile.vacationMode.endDate ? new Date(profile.vacationMode.endDate).toISOString().split('T')[0] : ''
                });
            }

            if (vendorsRes.data.length > 0) setSelectedVendor(vendorsRes.data[0]._id);
            setLoading(false);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
            } else {
                toast.error('Failed to fetch data');
            }
            setLoading(false);
        }
    };

    const toggleVacationMode = async () => {
        if (!vacationMode) {
            setShowVacationModal(true);
        } else {
            // Turn off
            try {
                await axios.post(`${API_URL}/users/vacation`, { isActive: false }, config);
                setVacationMode(false);
                toast.success('Welcome back! Vacation mode disabled.');
            } catch (error) {
                toast.error('Failed to update vacation status');
            }
        }
    };

    const confirmVacation = async () => {
        try {
            await axios.post(`${API_URL}/users/vacation`, {
                isActive: true,
                startDate: vacationDates.start,
                endDate: vacationDates.end
            }, config);
            setVacationMode(true);
            setShowVacationModal(false);
            toast.success('Vacation mode enabled. Deliveries paused.');
        } catch (error) {
            toast.error('Failed to set vacation mode');
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/users/orders`, { quantity, vendorId: selectedVendor, timeSlot }, config);
            toast.success('Order placed with ' + timeSlot + ' slot!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        }
    };

    const handleRepeatOrder = async () => {
        try {
            await axios.post(`${API_URL}/features/repeat-order`, {}, config);
            toast.success('Yesterday\'s order repeated!');
            fetchData();
        } catch (error) {
            toast.error('No previous order found');
        }
    };

    const handleToggleSub = async (subId, status) => {
        try {
            await axios.put(`${API_URL}/subscriptions/${subId}`, { status }, config);
            toast.success(`Subscription ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update subscription');
        }
    };

    const handleTopup = () => {
        setShowTopupModal(true);
    };

    const handleConfirmTopup = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const amount = parseInt(formData.get('amount'));
        setShowTopupModal(false);
        handleRecharge(null, amount);
    };


    const handleRecharge = async (planId = null, customAmount = null) => {
        try {
            const amount = planId
                ? prepaidPlans.find(p => p._id === planId)?.amount
                : customAmount;

            if (!amount || amount < 10) {
                toast.error('Minimum recharge amount is ₹10');
                return;
            }

            // Ensure Razorpay is loaded
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // Create Razorpay order
            const { data } = await axios.post(
                `${API_URL}/wallet/create-order`,
                { amount, planId },
                config
            );

            if (!data.success) {
                toast.error('Failed to create payment order');
                return;
            }

            // Open Razorpay payment gateway
            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'JalConnect',
                description: 'Wallet Recharge',
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        const verifyData = await axios.post(
                            `${API_URL}/wallet/verify-payment`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            config
                        );

                        if (verifyData.data.success) {
                            toast.success(`Payment successful! ₹${data.order.totalCredit} added.`);
                            fetchData();
                        }
                    } catch (error) {
                        toast.error('Payment verification failed');
                        console.error(error);
                    }
                },
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#0EA5E9',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(`Payment failed: ${errorMsg}`);
            console.error('Recharge Error:', error);
        }
    };



    // New Feature Handlers
    const handleBottleReturn = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await axios.post(`${API_URL}/users/bottle-returns`, {
                orderId: selectedOrderForReturn,
                quantityReturned: parseInt(formData.get('quantity')),
                notes: formData.get('notes')
            }, config);
            toast.success('Bottle return request submitted! ♻️');
            setShowReturnModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit return');
        }
    };

    const handleScheduleOrder = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await axios.post(`${API_URL}/users/scheduled-orders`, {
                vendorId: formData.get('vendor'),
                quantity: parseInt(formData.get('quantity')),
                scheduledDate: formData.get('date'),
                timeSlot: formData.get('timeSlot'),
                recurring: formData.get('recurring') === 'on',
                frequency: formData.get('frequency') || 'None',
                notes: formData.get('notes')
            }, config);
            toast.success('Order scheduled successfully! 📅');
            setShowScheduleModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to schedule order');
        }
    };

    const handleCancelScheduled = async (id) => {
        try {
            await axios.put(`${API_URL}/users/scheduled-orders/${id}/cancel`, {}, config);
            toast.success('Scheduled order cancelled');
            fetchData();
        } catch (error) {
            toast.error('Failed to cancel');
        }
    };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await axios.post(`${API_URL}/users/complaints`, {
                vendorId: formData.get('vendor'),
                orderId: selectedOrderForComplaint,
                category: formData.get('category'),
                message: formData.get('message')
            }, config);
            toast.success('Complaint submitted. We will resolve it soon! 💬');
            setShowComplaintModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit complaint');
        }
    };


    const handleDownloadInvoice = async (month, year) => {
        try {
            const response = await axios.get(`${API_URL}/users/invoice/${month}/${year}`, {
                ...config,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${month}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('No orders found for this month');
        }
    };


    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-sky-400" size={48} />
            <p className="text-slate-400 font-medium">Loading your water dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 pb-20 relative overflow-hidden font-sans selection:bg-sky-500/30">
            {/* Vacation Mode Modal */}
            <AnimatePresence>
                {showVacationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-rose-500"></div>
                            <div className="mb-6 text-center">
                                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-400">
                                    <Pause size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Pause Deliveries?</h3>
                                <p className="text-sm text-slate-400">Select dates to pause your daily water supply. We will resume automatically.</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Start Date</label>
                                    <input
                                        type="date"
                                        className="input-field w-full"
                                        value={vacationDates.start}
                                        onChange={(e) => setVacationDates({ ...vacationDates, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">End Date (Optional)</label>
                                    <input
                                        type="date"
                                        className="input-field w-full"
                                        value={vacationDates.end}
                                        onChange={(e) => setVacationDates({ ...vacationDates, end: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowVacationModal(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300">Cancel</button>
                                <button onClick={confirmVacation} className="flex-1 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20">Confirm Pause</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
                {usageAlert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-4"
                    >
                        <ShieldAlert className="text-rose-500" size={24} />
                        <div>
                            <p className="text-white font-bold text-sm">Abnormal Usage Detected!</p>
                            <p className="text-xs text-slate-400">Your water consumption is 5x higher than the society average today. Please check for leaks.</p>
                        </div>
                    </motion.div>
                )}
                {/* Header with Notifications */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 water-gradient rounded-2xl flex items-center justify-center shadow-xl shadow-sky-500/20">
                            <Droplet className="text-white fill-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {user.name}</h1>
                            <p className="text-slate-400 flex items-center gap-2">
                                <MapPin size={16} /> Tower {user.towerNumber} • Flat {user.flatNumber}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleVacationMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${vacationMode ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
                        >
                            {vacationMode ? <Play size={16} /> : <Pause size={16} />}
                            {vacationMode ? 'Resume' : 'Vacation'}
                        </button>

                        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border-sky-500/20">
                            <Wallet className="text-sky-400" size={20} />
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Balance</span>
                                <span className="text-lg font-bold text-white">₹{wallet?.balance || 0}</span>
                            </div>
                            <button onClick={handleTopup} className="ml-2 w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 hover:bg-sky-500/20 transition-all">+</button>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setActiveChat({ id: vendors[0]?.user?._id || vendors[0]?.user, name: vendors[0]?.vendorName || 'Support' })}
                                className="w-12 h-12 glass rounded-xl flex items-center justify-center text-slate-300 hover:text-white relative hover:scale-105 transition-all"
                                title="Messages"
                            >
                                <MessageCircle size={24} />
                            </button>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotification(!showNotification)}
                                className="w-12 h-12 glass rounded-xl flex items-center justify-center text-slate-300 hover:text-white relative hover:scale-105 transition-all"
                            >
                                <Bell size={24} />
                                {notifications.some(n => !n.isRead) && (
                                    <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                )}
                            </button>
                            <AnimatePresence>
                                {showNotification && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-4 w-80 glass rounded-2xl shadow-2xl z-[100] border-white/10 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                            <span className="font-bold text-white">Notifications</span>
                                            <span className="text-xs text-sky-400">Mark all as read</span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(note => (
                                                    <div key={note._id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!note.isRead ? 'bg-sky-500/5' : ''}`}>
                                                        <p className="text-sm font-semibold text-white mb-1">{note.title}</p>
                                                        <p className="text-xs text-slate-400 leading-relaxed">{note.message}</p>
                                                        <span className="text-[10px] text-slate-500 mt-2 block">{new Date(note.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-10 text-center text-slate-500 text-sm italic">No new notifications</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap p-1 bg-white/5 rounded-xl w-fit gap-1">
                    {[
                        { id: 'orders', label: 'Orders', icon: ShoppingCart },
                        { id: 'scheduled', label: 'Scheduled', icon: CalendarPlus },
                        { id: 'messages', label: 'Messages', icon: MessageSquare },
                        { id: 'returns', label: 'Returns', icon: Recycle },
                        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'wallet', label: 'Wallet', icon: Wallet }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >

                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Referral & Loyalty Points Banner */}
                {referralData && (
                    <div className="glass-card border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Gift className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Your Referral Code</p>
                                    <p className="text-2xl font-black text-white tracking-wider">{referralData.referralCode}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                    <Award className="text-amber-400" size={20} />
                                    <span className="text-2xl font-black text-white">{referralData.loyaltyPoints}</span>
                                </div>
                                <p className="text-xs text-slate-400">Loyalty Points</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Users className="text-sky-400" size={16} />
                                    <span className="text-sm text-slate-300">{referralData.referralsCount} Referrals</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="glass px-5 py-3 rounded-xl flex items-center gap-2 text-sky-400 hover:bg-sky-500/10 transition-all hover:scale-105"
                    >
                        <CalendarPlus size={20} />
                        <span className="text-sm font-bold">Schedule Order</span>
                    </button>

                    <button
                        onClick={() => setShowReturnModal(true)}
                        className="glass px-5 py-3 rounded-xl flex items-center gap-2 text-emerald-400 hover:bg-emerald-500/10 transition-all hover:scale-105"
                    >
                        <Recycle size={20} />
                        <span className="text-sm font-bold">Return Bottles</span>
                    </button>

                    <button
                        onClick={() => setShowComplaintModal(true)}
                        className="glass px-5 py-3 rounded-xl flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-all hover:scale-105"
                    >
                        <MessageSquare size={20} />
                        <span className="text-sm font-bold">Report Issue</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('analytics')}
                        className="glass px-5 py-3 rounded-xl flex items-center gap-2 text-purple-400 hover:bg-purple-500/10 transition-all hover:scale-105"
                    >
                        <BarChart3 size={20} />
                        <span className="text-sm font-bold">View Analytics</span>
                    </button>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Interactive Panel */}
                    <div className="lg:col-span-1 space-y-6">

                        {activeTab === 'orders' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Quick Buy</h2>
                                    <button
                                        onClick={handleRepeatOrder}
                                        className="text-xs font-bold text-sky-400 flex items-center gap-1 hover:text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <Repeat size={14} /> Repeat Last
                                    </button>
                                </div>

                                <form onSubmit={handlePlaceOrder} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Vendor</label>
                                        <select
                                            className="input-field appearance-none bg-slate-800/50"
                                            value={selectedVendor}
                                            onChange={(e) => setSelectedVendor(e.target.value)}
                                        >
                                            {vendors.map(v => (
                                                <option key={v._id} value={v._id} className="bg-slate-800">
                                                    {v.vendorName} - ₹{v.pricePerBottle}/bottle
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Delivery Time Slot</label>
                                        <select
                                            className="input-field appearance-none bg-slate-800/50"
                                            value={timeSlot}
                                            onChange={(e) => setTimeSlot(e.target.value)}
                                        >
                                            <option value="06:00 AM - 09:00 AM">Morning (06:00 - 09:00 AM)</option>
                                            <option value="09:00 AM - 12:00 PM">Midday (09:00 - 12:00 PM)</option>
                                            <option value="04:00 PM - 08:00 PM">Evening (04:00 - 08:00 PM)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Number of Bottles</label>
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-12 h-12 glass flex items-center justify-center rounded-xl hover:bg-white/10 text-2xl font-light transition-all"
                                            >-</button>
                                            <span className="text-4xl font-black text-white">{quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="w-12 h-12 glass flex items-center justify-center rounded-xl hover:bg-white/10 text-2xl font-light transition-all"
                                            >+</button>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 pt-6 space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-slate-400 text-sm">Estimated Total</span>
                                            <span className="text-3xl font-bold text-white">₹{quantity * (vendors.find(v => v._id === selectedVendor)?.pricePerBottle || 30)}</span>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!selectedVendor}
                                            className={`btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 group ${!selectedVendor ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Confirm Order <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </button>

                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'subscriptions' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card bg-gradient-to-br from-sky-500/10 to-transparent"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                                        <Calendar size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Setup Auto-Delivery</h2>
                                </div>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">Save time by subscribing for daily water. No need to order every day manually.</p>
                                <button className="btn-secondary w-full py-3 rounded-xl flex items-center justify-center gap-2">
                                    Create New Plan <Play size={16} />
                                </button>
                            </motion.div>
                        )}

                        {/* Daily Status Tracker Banner */}
                        <div className="glass-card border-emerald-500/20 bg-emerald-500/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Delivery Status</span>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                            {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length > 0 ? (
                                <div className="space-y-4">
                                    {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').slice(0, 1).map(order => (
                                        <div key={order._id}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <Truck className="text-white" size={24} />
                                                <div>
                                                    <p className="text-white font-bold">{order.status}</p>
                                                    <p className="text-xs text-slate-400">{order.quantity} Bottles • {order.vendor?.vendorName}</p>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-sky-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: order.status === 'Pending' ? '20%' : order.status === 'Accepted' ? '50%' : '80%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No active deliveries right now</p>
                            )}
                        </div>
                    </div>

                    {/* Right Content Panel (History, Subs, etc) */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'subscriptions' ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">Your Subscriptions</h2>
                                {subscriptions.length === 0 ? (
                                    <div className="glass-card text-center py-10 opacity-60">
                                        <Calendar size={48} className="mx-auto mb-4 text-slate-600" />
                                        <p>No active subscriptions found</p>
                                    </div>
                                ) : (
                                    subscriptions.map(sub => (
                                        <div key={sub._id} className="glass-card flex flex-col md:flex-row gap-6 justify-between items-center border-l-4 border-l-sky-500">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{sub.frequency} Plan </h3>
                                                <p className="text-sm text-slate-400">{sub.quantity} Bottle{sub.quantity > 1 ? 's' : ''} every day</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${sub.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                        {sub.status}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">Started {new Date(sub.startDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {sub.status === 'Active' ? (
                                                    <button onClick={() => handleToggleSub(sub._id, 'Paused')} className="glass px-4 py-2 rounded-lg text-amber-400 text-sm flex items-center gap-2 hover:bg-amber-400/10">
                                                        <Pause size={14} /> Pause
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleToggleSub(sub._id, 'Active')} className="glass px-4 py-2 rounded-lg text-emerald-400 text-sm flex items-center gap-2 hover:bg-emerald-400/10">
                                                        <Play size={14} /> Resume
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : activeTab === 'messages' ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-white">Your Conversations</h2>
                                    <button className="text-[10px] font-bold text-sky-400 uppercase tracking-widest hover:text-white transition-all">Mark all as read</button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {orders.length > 0 ? (
                                        [...new Map(orders.filter(o => o.vendor).map(o => [o.vendor._id, o])).values()].map(order => (
                                            <motion.div
                                                key={order.vendor._id}
                                                whileHover={{ x: 10, backgroundColor: 'rgba(56, 189, 248, 0.05)' }}
                                                onClick={() => setActiveChat({ id: order.vendor.user?._id || order.vendor.user, name: order.vendor.vendorName })}
                                                className="glass-card flex items-center justify-between cursor-pointer border-l-4 border-l-sky-500 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-sky-500/20 to-sky-600/20 rounded-2xl flex items-center justify-center text-sky-400 font-black text-xl border border-sky-500/20 shadow-inner">
                                                        {order.vendor.vendorName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight">{order.vendor.vendorName}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Vendor</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-sky-500 transition-all">
                                                        <MessageCircle size={18} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="glass-card text-center py-24 opacity-60">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <MessageSquare size={40} className="text-slate-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">No Conversations Found</h3>
                                            <p className="text-slate-500 max-w-xs mx-auto">Start a chat with your vendor from the order history section.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === 'wallet' ? (
                            <div className="space-y-8">
                                {/* Wallet Balance Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div>
                                            <p className="text-sky-100 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
                                            <h2 className="text-5xl font-black">₹{wallet?.balance || 0}</h2>
                                        </div>
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <Wallet size={32} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 relative z-10">
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <p className="text-sky-100 text-[10px] font-bold uppercase mb-1">Total Credited</p>
                                            <p className="text-xl font-bold">₹{wallet?.totalCredited || 0}</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <p className="text-sky-100 text-[10px] font-bold uppercase mb-1">Total Spent</p>
                                            <p className="text-xl font-bold">₹{wallet?.totalDebited || 0}</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hidden md:block">
                                            <p className="text-sky-100 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                                                <Gift size={10} /> Cashback
                                            </p>
                                            <p className="text-xl font-bold text-amber-300">₹{wallet?.totalCashback || 0}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowTopupModal(true)}
                                        className="w-full bg-white text-sky-600 font-black py-4 rounded-2xl hover:bg-sky-50 transition-all flex items-center justify-center gap-2 shadow-xl relative z-10 group"
                                    >
                                        <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                        Recharge Wallet
                                    </button>
                                </motion.div>

                                {/* Prepaid Plans */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                                        <Sparkles className="text-amber-400" size={20} /> Exclusive Prepaid Plans
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {prepaidPlans.map((plan) => (
                                            <motion.div
                                                key={plan._id}
                                                whileHover={{ y: -5 }}
                                                className={`glass-card p-6 border-2 group relative overflow-hidden ${plan.isPremium ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'}`}
                                            >
                                                {plan.isPremium && (
                                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-tighter">
                                                        Premium Selection
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-black text-sky-400">₹{plan.amount}</span>
                                                            {plan.bonusAmount > 0 && (
                                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md">
                                                                    +₹{plan.bonusAmount} Bonus
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 mb-6 line-clamp-2">{plan.description}</p>
                                                <button
                                                    onClick={() => handleRecharge(plan._id)}
                                                    className="w-full py-2.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-sky-500 hover:text-white transition-all border border-white/10 hover:border-sky-500 flex items-center justify-center gap-2"
                                                >
                                                    Select Plan <ArrowRight size={16} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                                        <RefreshCw className="text-sky-400" size={20} /> Recent Transactions
                                    </h3>
                                    <div className="glass shadow-xl rounded-2xl overflow-hidden border border-white/5">
                                        {transactions.length === 0 ? (
                                            <div className="p-10 text-center text-slate-500 italic">No transactions found</div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {transactions.slice(0, 10).map((tx, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.transactionType === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                                {tx.transactionType === 'credit' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{tx.description}</p>
                                                                <p className="text-[10px] text-slate-500 font-medium">
                                                                    {new Date(tx.createdAt || tx.date).toLocaleDateString()} • {new Date(tx.createdAt || tx.date).toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-black text-lg ${tx.transactionType === 'credit' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                                {tx.transactionType === 'credit' ? '+' : '-'}₹{tx.amount}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Balance: ₹{tx.balanceAfter}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        ) : activeTab === 'analytics' ? (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-white">Consumption Insights</h2>
                                    <div className="bg-white/5 p-1 rounded-xl flex gap-1">
                                        {['Weekly', 'Monthly', 'Yearly'].map(p => (
                                            <button key={p} className="px-4 py-1.5 text-[10px] font-bold uppercase rounded-lg text-slate-400 hover:text-white transition-all">{p}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-card p-6 border-sky-500/20 bg-sky-500/5">
                                        <p className="text-xs font-bold text-sky-400 uppercase mb-4">Comparison</p>
                                        <div className="flex items-end gap-4 h-32">
                                            <div className="flex-1 bg-white/10 rounded-t-xl relative group">
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">Society</div>
                                                <motion.div initial={{ height: 0 }} animate={{ height: '60%' }} className="absolute bottom-0 w-full bg-slate-700/50 rounded-t-xl" />
                                            </div>
                                            <div className="flex-1 bg-white/10 rounded-t-xl relative group">
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-sky-400">You</div>
                                                <motion.div initial={{ height: 0 }} animate={{ height: '85%' }} className="absolute bottom-0 w-full water-gradient rounded-t-xl shadow-lg shadow-sky-500/20" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-6 leading-relaxed">You are using <span className="text-sky-400 font-bold">15% more</span> water than the society average this month.</p>
                                    </div>

                                    {/* Download Invoices Section */}
                                    <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                                        <p className="text-xs font-bold text-purple-400 uppercase mb-4">Monthly Statements</p>
                                        <div className="space-y-3">
                                            {["January", "December", "November"].map(month => (
                                                <div key={month} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-purple-500/30 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                            <Package size={16} />
                                                        </div>
                                                        <span className="text-sm font-bold text-white">{month} 2026</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(month, 2026)}
                                                        className="text-[10px] font-black uppercase text-purple-400 hover:text-white transition-colors"
                                                    >
                                                        Download PDF
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                                    <div className="flex gap-2">
                                        {['All', 'Pending', 'Delivered'].map(f => (
                                            <button key={f} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-slate-400 hover:text-white transition-all">{f}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {orders.length === 0 ? (
                                        <div className="glass-card text-center py-20 opacity-60">
                                            <Package size={48} className="mx-auto mb-4 text-slate-600" />
                                            <p>No orders yet. Place your first order today!</p>
                                        </div>
                                    ) : (
                                        orders.map(order => (
                                            <div key={order._id} className="glass-card hover:border-white/20 transition-all group">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-${order.status === 'Delivered' ? 'emerald' : order.status === 'Cancelled' ? 'rose' : 'amber'}-500/10 text-${order.status === 'Delivered' ? 'emerald' : order.status === 'Cancelled' ? 'rose' : 'amber'}-400`}>
                                                            {order.status === 'Delivered' ? <CheckCircle size={24} /> : order.status === 'Cancelled' ? <XCircle size={24} /> : <Clock size={24} />}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-white text-lg">{order.quantity} Water Bottles <span className="text-xs font-normal text-slate-500 ml-2">#{order._id.slice(-6).toUpperCase()}</span></h3>
                                                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                                                By {order.vendor?.vendorName} • {new Date(order.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500 font-bold uppercase">Amount</p>
                                                            <p className="font-black text-xl text-white">₹{order.totalAmount}</p>
                                                        </div>
                                                        <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${order.status === 'Delivered' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-sky-500/5 text-sky-400 border-sky-500/20'}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                                                    <button
                                                        onClick={() => setActiveChat({ id: order.vendor?.user?._id || order.vendor?.user, name: order.vendor?.vendorName || 'Vendor' })}
                                                        className="flex-1 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-sky-500/20 shadow-lg shadow-sky-500/5 group/btn"
                                                    >
                                                        <MessageCircle size={14} className="group-hover/btn:scale-110 transition-transform" /> Chat with Vendor
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Modals */}
                <BottleReturnModal
                    show={showReturnModal}
                    onClose={() => setShowReturnModal(false)}
                    onSubmit={handleBottleReturn}
                    orders={orders}
                />

                <ScheduleOrderModal
                    show={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    onSubmit={handleScheduleOrder}
                    vendors={vendors}
                />

                <ComplaintModal
                    show={showComplaintModal}
                    onClose={() => setShowComplaintModal(false)}
                    onSubmit={handleSubmitComplaint}
                    vendors={vendors}
                    orders={orders}
                />

                <WalletTopupModal
                    show={showTopupModal}
                    onClose={() => setShowTopupModal(false)}
                    onSubmit={handleConfirmTopup}
                />

                <AnimatePresence>
                    {activeChat && (
                        <ChatBox
                            currentUser={user}
                            receiverId={activeChat.id}
                            receiverName={activeChat.name}
                            onClose={() => setActiveChat(null)}
                        />
                    )}
                </AnimatePresence>

                {/* Floating Chat Button */}
                {!activeChat && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveChat({ id: vendors[0]?.user?._id || vendors[0]?.user, name: vendors[0]?.vendorName || 'Support' })}
                        className="fixed bottom-8 right-8 w-16 h-16 bg-sky-500 text-white rounded-full shadow-2xl shadow-sky-500/40 flex items-center justify-center z-[90] hover:bg-sky-600 transition-colors"
                    >
                        <MessageSquare size={30} fill="currentColor" className="opacity-20 absolute" />
                        <MessageCircle size={30} className="relative z-10" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-[10px] font-bold">!</span>
                    </motion.button>
                )}
            </div >

        </div >
    );
};

export default UserDashboard;
