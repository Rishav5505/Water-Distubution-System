import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Truck, CheckCircle, Package, DollarSign, Clock,
    Power, MapPin, ListOrdered, Navigation, Filter,
    MoreVertical, ChevronRight, Droplets, Users, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBox from '../components/ChatBox';


const VendorDashboard = () => {
    const { user, logout } = useAuth();
    const [vendorProfile, setVendorProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('route'); // 'route', 'list', or 'customers'
    const [selectedSociety, setSelectedSociety] = useState('');
    const [activeChat, setActiveChat] = useState(null);



    const API_URL = 'http://localhost:5000/api';
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchData();
    }, [selectedSociety]); // Fetch when society changes

    const fetchData = async () => {
        try {
            const [profileRes, ordersRes, customersRes] = await Promise.all([
                axios.get(`${API_URL}/vendors/profile`, config),
                axios.get(`${API_URL}/vendors/orders/today${selectedSociety ? `?societyId=${selectedSociety}` : ''}`, config),
                axios.get(`${API_URL}/vendors/customers`, config)
            ]);
            setVendorProfile(profileRes.data);
            setOrders(ordersRes.data);
            setCustomers(customersRes.data);
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


    const handleUpdateStatus = async (orderId, status) => {
        try {
            await axios.put(`${API_URL}/vendors/orders/${orderId}/status`, { status }, config);
            toast.success(`Order marked as ${status}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const toggleStatus = async () => {
        try {
            await axios.put(`${API_URL}/vendors/status`, {}, config);
            fetchData();
            toast.success(vendorProfile?.isActive ? 'You are now OFFLINE' : 'You are now ONLINE');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Logic for Route Optimization (Tower Grouping)
    const groupedOrders = orders.reduce((acc, order) => {
        // Safety check: ensure order.user exists
        if (!order.user) return acc;

        const tower = order.user.towerNumber;
        if (!acc[tower]) acc[tower] = { orders: [], count: 0 };
        acc[tower].orders.push(order);
        acc[tower].count += order.quantity;
        return acc;
    }, {});

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium tracking-wide">Syncing Deliveries...</p>
            </div>
        </div>
    );

    if (!vendorProfile) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <p className="text-xl text-slate-400">Unable to load profile.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-sky-500 text-white rounded-lg">Retry</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            {/* Header with Society Selector */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Abstract Background Decoration */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center border-white/20 shadow-xl overflow-hidden">
                        <div className="w-full h-full water-gradient flex items-center justify-center">
                            <Users className="text-white" size={32} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black text-white">{vendorProfile.vendorName}</h1>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${vendorProfile.isActive ? 'bg-emerald-500 shadow-emerald-500/20 text-white' : 'bg-rose-500 shadow-rose-500/20 text-white'}`}>
                                {vendorProfile.isActive ? 'Online' : 'Offline'}
                            </div>
                        </div>

                        {/* Society Selector */}
                        <div className="flex items-center gap-3 mt-2">
                            <MapPin size={18} className="text-sky-400" />
                            <select
                                value={selectedSociety}
                                onChange={(e) => setSelectedSociety(e.target.value)}
                                className="bg-slate-900 border border-white/10 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2"
                            >
                                <option value="">All Societies</option>
                                {vendorProfile.societies && vendorProfile.societies.map(soc => (
                                    <option key={soc._id} value={soc._id}>{soc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10">
                    <button
                        onClick={toggleStatus}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all text-sm border-2 ${vendorProfile.isActive ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}
                    >
                        <Power size={20} />
                        {vendorProfile.isActive ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Today Orders', value: orders.length, icon: Package, color: 'sky' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'amber' },
                    { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle, color: 'emerald' },
                    { label: 'Est. Earnings', value: `₹${vendorProfile.totalEarnings}`, icon: DollarSign, color: 'cyan' }
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card hover:bg-white/[0.08]"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 bg-${stat.color}-500/20 rounded-2xl flex items-center justify-center text-${stat.color}-400 shadow-xl shadow-${stat.color}-500/10`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                                <span className="text-3xl font-black text-white">{stat.value}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Navigation className="text-sky-400" size={32} /> Delivery Routes
                    </h2>
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('route')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'route' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}
                        >
                            <Navigation size={18} /> Optimized Route
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}
                        >
                            <ListOrdered size={18} /> Flat Wise
                        </button>
                        <button
                            onClick={() => setViewMode('customers')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'customers' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400'}`}
                        >
                            <Users size={18} /> All Users
                        </button>
                    </div>

                </div>

                {orders.length === 0 ? (
                    <div className="glass-card text-center py-24 border-dashed border-2 border-white/5">
                        <Droplets size={64} className="mx-auto text-slate-700 mb-6 animate-pulse" />
                        <h3 className="text-2xl font-bold text-white mb-2">No orders assigned for today yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Orders will appear here as residents start placing them. Make sure you are online!</p>
                    </div>
                ) : viewMode === 'route' ? (
                    <div className="space-y-12">
                        {Object.keys(groupedOrders).sort().map(tower => (
                            <motion.div layout key={tower} className="space-y-6">
                                <div className="flex items-baseline gap-4 border-b border-white/5 pb-4">
                                    <span className="text-4xl font-black text-sky-400 opacity-40">TOWER {tower}</span>
                                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Deliver {groupedOrders[tower].count} Bottles Total</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedOrders[tower].orders.sort((a, b) => a.user.flatNumber - b.user.flatNumber).map(order => (
                                        <DeliveryCard key={order._id} order={order} onUpdate={handleUpdateStatus} onChat={(u) => setActiveChat(u)} />
                                    ))}

                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.sort((a, b) => a.user.flatNumber - b.user.flatNumber).map(order => (
                            <DeliveryCard key={order._id} order={order} onUpdate={handleUpdateStatus} onChat={(u) => setActiveChat(u)} />
                        ))}
                    </div>

                ) : (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">User Name</th>
                                        <th className="px-6 py-4">Society Name</th>
                                        <th className="px-6 py-4">Tower & Flat</th>
                                        <th className="px-6 py-4">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {customers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-slate-500 italic">No users found in your societies</td>
                                        </tr>
                                    ) : (
                                        customers.map(customer => (
                                            <tr key={customer._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold">
                                                            {customer.name.charAt(0)}
                                                        </div>
                                                        <span className="text-white font-bold">{customer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">{customer.society?.name || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sky-400 font-bold">T-{customer.towerNumber}</span>
                                                    <span className="text-white font-bold ml-2">F-{customer.flatNumber}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">{customer.email}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

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
        </div>
    );
};

// Extracted Component for better readability
const DeliveryCard = ({ order, onUpdate, onChat }) => {
    const statuses = ['Pending', 'Accepted', 'On The Way', 'Delivered', 'Cancelled'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card relative overflow-hidden group transition-all duration-500 ${order.status === 'Delivered' ? 'border-emerald-500/30 bg-emerald-500/5 opacity-80' : 'hover:border-sky-500/40'}`}
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-sky-500'}`}></div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-black text-white mb-1">Flat {order.user.flatNumber}</h3>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <Users size={14} className="text-sky-400" /> {order.user.name}
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300'}`}>
                    {order.status}
                </div>
            </div>

            <button
                onClick={() => onChat({ id: order.user._id, name: order.user.name })}
                className="absolute top-4 right-16 p-2 bg-white/5 hover:bg-sky-500/10 text-sky-400 rounded-lg transition-colors border border-white/5"
                title="Chat with Resident"
            >
                <MessageCircle size={16} />
            </button>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Droplets className="text-sky-400" size={24} />
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Quantity</span>
                        <span className="text-xl font-bold text-white">{order.quantity} x 20L Bottles</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {order.status === 'Pending' && (
                    <button onClick={() => onUpdate(order._id, 'Accepted')} className="btn-primary w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        Accept Order <ChevronRight size={16} />
                    </button>
                )}
                {order.status === 'Accepted' && (
                    <button onClick={() => onUpdate(order._id, 'On The Way')} className="bg-sky-500 hover:bg-sky-600 text-white w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        Start Delivery <Navigation size={16} />
                    </button>
                )}
                {order.status === 'On The Way' && (
                    <button onClick={() => onUpdate(order._id, 'Delivered')} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        Mark Delivered <CheckCircle size={16} />
                    </button>
                )}
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button onClick={() => onUpdate(order._id, 'Cancelled')} className="text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all">
                        Cancel
                    </button>
                )}
                {order.status === 'Delivered' && (
                    <div className="text-emerald-400 text-center py-2 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2">
                        <CheckCircle size={14} /> Completed
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default VendorDashboard;

