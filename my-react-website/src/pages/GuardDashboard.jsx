import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Truck, ArrowRightLeft, Package, Search, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const GuardDashboard = () => {
    const { user } = useAuth();
    const [searchId, setSearchId] = useState('');
    const [scannedOrder, setScannedOrder] = useState(null);
    const [bottlesOut, setBottlesOut] = useState(0);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api/enterprise';
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/orders/${searchId}`, config);
            setScannedOrder(res.data);
            setBottlesOut(res.data.quantity); // Default assuming they return same amount
            setLoading(false);
        } catch (error) {
            toast.error('Order not found');
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            await axios.post(`${API_URL}/guard/verify`, {
                orderId: scannedOrder._id,
                bottlesIn: scannedOrder.quantity,
                bottlesOut: bottlesOut
            }, config);
            toast.success('Gate Pass Verified');
            setScannedOrder(null);
            setSearchId('');
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
            <header className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Security Gate Pass</h1>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Society: {user.societyName || 'JalConnect Prime'}</p>
                </div>
            </header>

            <div className="glass-card">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Scan Order ID or Token..."
                        className="input-field pl-12 pr-32"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-sky-500 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-sky-400 transition-all"
                    >
                        Check
                    </button>
                </div>

                {scannedOrder ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Logistics Partner</p>
                                <p className="text-white font-bold">{scannedOrder.vendor?.vendorName}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Destination</p>
                                <p className="text-white font-bold">Flat {scannedOrder.flatNumber} (Tower {scannedOrder.towerNumber})</p>
                            </div>
                        </div>

                        <div className="p-6 bg-sky-500/5 rounded-3xl border border-sky-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-bold">{scannedOrder.quantity} Full Bottles</p>
                                    <p className="text-xs text-slate-500">Entering Society</p>
                                </div>
                            </div>
                            <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <Truck className="text-sky-500 opacity-50" size={32} />
                            </motion.div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Empty Bottles Exiting</label>
                            <div className="flex items-center gap-6">
                                <button onClick={() => setBottlesOut(Math.max(0, bottlesOut - 1))} className="w-12 h-12 glass rounded-xl text-2xl font-light">-</button>
                                <span className="text-4xl font-black text-white">{bottlesOut}</span>
                                <button onClick={() => setBottlesOut(bottlesOut + 1)} className="w-12 h-12 glass rounded-xl text-2xl font-light">+</button>
                            </div>
                        </div>

                        <button onClick={handleVerify} className="btn-primary w-full py-5 rounded-2xl font-black tracking-widest uppercase">
                            Approve Entry & Verify Load
                        </button>
                    </motion.div>
                ) : (
                    <div className="text-center py-20 opacity-30">
                        <Camera size={64} className="mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase">Ready to scan delivery token</p>
                    </div>
                )}
            </div>

            {/* Recent Verified Log */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest ml-2">Today's Gate Log</h3>
                <div className="glass-card p-0 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5">
                            <tr className="text-[10px] text-slate-500 font-bold uppercase">
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Full/Empty</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            <tr className="border-b border-white/5">
                                <td className="px-6 py-4 text-white">09:12 AM</td>
                                <td className="px-6 py-4 text-slate-400">ABC Water</td>
                                <td className="px-6 py-4 text-sky-400 font-bold">4 IN / 4 OUT</td>
                                <td className="px-6 py-4 text-right text-emerald-400 font-bold">VERIFIED</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GuardDashboard;
