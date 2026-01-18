import { motion, AnimatePresence } from 'framer-motion';
import { X, Recycle, CalendarPlus, MessageSquare, Wallet } from 'lucide-react';

export const BottleReturnModal = ({ show, onClose, onSubmit, orders }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="glass-card max-w-md w-full p-6 md:p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                <Recycle className="text-emerald-400" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Return Empty Bottles</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Select Order</label>
                            <select name="order" required className="input-field bg-slate-800/50">
                                <option value="">Choose delivered order...</option>
                                <option value="none">Not related to any order</option>
                                {orders?.filter(o => o.status === 'Delivered').map(order => (
                                    <option key={order._id} value={order._id}>
                                        {order.quantity} bottles • {new Date(order.createdAt).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Quantity to Return</label>
                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                required
                                className="input-field bg-slate-800/50"
                                placeholder="Number of bottles"
                            />
                            <p className="text-xs text-slate-500 mt-1">₹10 refund per bottle</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                rows="3"
                                className="input-field bg-slate-800/50"
                                placeholder="Any additional information..."
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full py-3 rounded-xl">
                            Submit Return Request
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const ScheduleOrderModal = ({ show, onClose, onSubmit, vendors }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center">
                                <CalendarPlus className="text-sky-400" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Schedule Order</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Vendor</label>
                            <select name="vendor" required className="input-field bg-slate-800/50">
                                {vendors.map(v => (
                                    <option key={v._id} value={v._id}>
                                        {v.vendorName} - ₹{v.pricePerBottle}/bottle
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                defaultValue="1"
                                required
                                className="input-field bg-slate-800/50"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Scheduled Date</label>
                            <input
                                type="date"
                                name="date"
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className="input-field bg-slate-800/50"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Time Slot</label>
                            <select name="timeSlot" required className="input-field bg-slate-800/50">
                                <option value="06:00 AM - 09:00 AM">Morning (06:00 - 09:00 AM)</option>
                                <option value="09:00 AM - 12:00 PM">Midday (09:00 - 12:00 PM)</option>
                                <option value="04:00 PM - 08:00 PM">Evening (04:00 - 08:00 PM)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                            <input type="checkbox" name="recurring" id="recurring" className="w-4 h-4" />
                            <label htmlFor="recurring" className="text-sm text-white">Make this a recurring order</label>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Frequency</label>
                            <select name="frequency" className="input-field bg-slate-800/50">
                                <option value="None">One-time</option>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                rows="2"
                                className="input-field bg-slate-800/50"
                                placeholder="Special instructions..."
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full py-3 rounded-xl">
                            Schedule Order
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const ComplaintModal = ({ show, onClose, onSubmit, vendors, orders }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="glass-card max-w-md w-full p-6 md:p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
                                <MessageSquare className="text-rose-400" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Submit Complaint</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Vendor</label>
                            <select name="vendor" required className="input-field bg-slate-800/50">
                                {vendors.map(v => (
                                    <option key={v._id} value={v._id}>{v.vendorName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Related Order (Optional)</label>
                            <select name="order" className="input-field bg-slate-800/50">
                                <option value="">Not related to specific order</option>
                                {orders?.slice(0, 10).map(order => (
                                    <option key={order._id} value={order._id}>
                                        {order.quantity} bottles • {new Date(order.createdAt).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Category</label>
                            <select name="category" required className="input-field bg-slate-800/50">
                                <option value="Late Delivery">Late Delivery</option>
                                <option value="Quality Issue">Quality Issue</option>
                                <option value="Billing Issue">Billing Issue</option>
                                <option value="Behavior">Behavior</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Describe Your Issue</label>
                            <textarea
                                name="message"
                                rows="4"
                                required
                                className="input-field bg-slate-800/50"
                                placeholder="Please provide details about your complaint..."
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600">
                            Submit Complaint
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const WalletTopupModal = ({ show, onClose, onSubmit }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="glass-card max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center">
                                <Wallet className="text-sky-400" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Add Money</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Enter Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    name="amount"
                                    min="1"
                                    required
                                    className="input-field bg-slate-800/50 pl-8 text-2xl font-bold text-white"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[100, 500, 1000].map(amt => (
                                <button
                                    type="button"
                                    key={amt}
                                    onClick={(e) => {
                                        const form = e.target.closest('form');
                                        if (form) {
                                            const input = form.querySelector('input[name="amount"]');
                                            if (input) input.value = amt;
                                        }
                                    }}
                                    className="px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-300 transition-colors"
                                >
                                    +₹{amt}
                                </button>
                            ))}
                        </div>

                        <button type="submit" className="btn-primary w-full py-3 rounded-xl">
                            Add to Wallet
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);
