import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Users, Truck, LayoutGrid, Home, ShoppingBag,
    BarChart3, Settings, MoreVertical, TrendingUp,
    CheckCircle, XCircle, Calendar, Wallet, Star, ShieldAlert,
    ArrowUpRight, ArrowDownRight, Droplet, Search
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [towerData, setTowerData] = useState([]);
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const API_URL = 'http://localhost:5000/api';
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, vendorsRes, towerRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, config),
                axios.get(`${API_URL}/admin/users`, config),
                axios.get(`${API_URL}/admin/vendors`, config),
                axios.get(`${API_URL}/admin/reports/tower-wise`, config)
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setVendors(vendorsRes.data);
            setTowerData(towerRes.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch admin data');
            setLoading(false);
        }
    };

    const COLORS = ['#0ea5e9', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

    if (loading) return <div className="p-10 text-center text-sky-400 animate-pulse font-black text-2xl uppercase tracking-widest">JalConnect Core Admin Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Platform Intelligence</h1>
                    <p className="text-slate-400 font-medium">Monitoring society water infrastructure & fiscal performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass p-1 rounded-xl flex">
                        {['overview', 'vendors', 'residents', 'reports'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-sky-500 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Platform Revenue', value: `₹${stats.totalRevenue}`, trend: '+12.5%', icon: TrendingUp, color: 'emerald', sub: 'Gross volume' },
                    { label: 'Active Users', value: stats.totalUsers, trend: '+4', icon: Users, color: 'sky', sub: 'Registered flats' },
                    { label: 'Supply Fleet', value: stats.totalVendors, trend: 'Stable', icon: Truck, color: 'cyan', sub: 'Verified vendors' },
                    { label: 'Daily Volume', value: stats.todayOrders, trend: '-2%', icon: ShoppingBag, color: 'amber', sub: 'Today\'s bottles' }
                ].map((item, idx) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card group hover:bg-white/[0.07]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${item.color}-500/10 text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${item.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                {item.trend}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">{item.label}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{item.value}</span>
                                <span className="text-xs text-slate-600 font-bold">{item.sub}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Usage Chart */}
                    <div className="lg:col-span-2 glass-card">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart3 className="text-sky-400" /> Tower Consumption Analysis
                            </h2>
                            <select className="glass text-xs font-bold text-slate-400 px-3 py-1.5 rounded-lg outline-none cursor-pointer">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={towerData}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="_id" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Tower ID', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 10 }} />
                                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="totalBottles" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subscription Adoption */}
                    <div className="glass-card">
                        <h2 className="text-xl font-bold text-white mb-8">Service Mix</h2>
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Manual Orders', value: stats.totalOrders - 4 },
                                            { name: 'Subscriptions', value: 4 }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={10}
                                        dataKey="value"
                                    >
                                        {COLORS.map((color, idx) => <Cell key={idx} fill={color} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-2xl font-black text-white">4</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Plans</p>
                            </div>
                        </div>
                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-sky-500"></div> <span className="text-slate-400">Manual Orders</span></div>
                                <span className="font-bold text-white">{(stats.totalOrders - 12) || 85}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-cyan-400"></div> <span className="text-slate-400">Subscriptions</span></div>
                                <span className="font-bold text-white">{(4) || 15}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'vendors' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Ranking */}
                    <div className="lg:col-span-1 glass-card bg-gradient-to-b from-sky-500/5 to-transparent">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Star className="text-amber-400" size={20} /> Vendor Rankings
                        </h2>
                        <div className="space-y-6">
                            {vendors.sort((a, b) => b.totalEarnings - a.totalEarnings).map((v, idx) => (
                                <div key={v._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-black text-slate-700 group-hover:text-sky-500 transition-colors">0{idx + 1}</div>
                                        <div>
                                            <p className="font-bold text-white">{v.vendorName}</p>
                                            <div className="flex items-center gap-1">
                                                <Star className="text-amber-500 fill-amber-500" size={10} />
                                                <Star className="text-amber-500 fill-amber-500" size={10} />
                                                <Star className="text-amber-500 fill-amber-500" size={10} />
                                                <Star className="text-amber-500 fill-amber-500" size={10} />
                                                <Star className="text-slate-600" size={10} />
                                                <span className="text-[10px] text-slate-500 ml-1 ml-1 font-bold">4.2 (28 Reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-emerald-400">₹{v.totalEarnings}</p>
                                        <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Revenue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vendor Grid Edit */}
                    <div className="lg:col-span-2 glass-card">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-white">Manage Fleet Permissions</h2>
                            <button className="btn-primary px-4 py-2 text-xs rounded-xl font-black uppercase tracking-widest flex items-center gap-2">
                                <Truck size={14} /> Add New Vendor
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vendors.map(v => (
                                <div key={v._id} className="p-5 border border-white/5 bg-white/5 rounded-2xl hover:bg-white/[0.08] transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                                                {v.vendorName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-none mb-1">{v.vendorName}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{v.isActive ? 'Active Now' : 'Last seen 2h ago'}</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-y border-white/5 my-4">
                                        <span className="text-xs text-slate-400">Base Unit Rate</span>
                                        <span className="text-lg font-black text-white">₹{v.pricePerBottle}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 text-[10px] font-black uppercase tracking-widest py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">Activate</button>
                                        <button className="flex-1 text-[10px] font-black uppercase tracking-widest py-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-all">Audit Logs</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'residents' && (
                <div className="glass-card shadow-2xl p-0 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-white">Resident Database</h2>
                            <span className="px-3 py-1 bg-sky-500/10 text-sky-500 rounded-full text-[10px] font-black">{users.length} Total</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, flat or tower..."
                                className="glass py-3 pl-12 pr-6 rounded-2xl w-full md:w-80 text-sm focus:border-sky-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-8 py-6">Resident Profiler</th>
                                    <th className="px-8 py-6">Unit Location</th>
                                    <th className="px-8 py-6 text-center">Wallet Status</th>
                                    <th className="px-8 py-6 text-right">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u._id} className="group hover:bg-sky-500/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center font-black group-hover:water-gradient group-hover:text-white transition-all">{u.name[0]}</div>
                                                <div>
                                                    <p className="text-white font-bold group-hover:text-sky-400 transition-colors uppercase text-sm tracking-widest">{u.name}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Tower {u.towerNumber}</span>
                                            <span className="mx-2 text-slate-700">/</span>
                                            <span className="text-xs font-bold text-slate-500 tracking-tight">Flat {u.flatNumber}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-widest">
                                                Healthy
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-white transition-colors">
                                                Manage Entity
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
