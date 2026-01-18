import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Wallet as WalletIcon,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Gift,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    Sparkles,
    DollarSign,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { WalletTopupModal } from '../components/UserModals';

const WalletPage = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [prepaidPlans, setPrepaidPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showTopupModal, setShowTopupModal] = useState(false);

    // ... existing useEffect ...

    const handleConfirmTopup = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const amount = parseInt(formData.get('amount'));

        if (!user?.token) {
            toast.error('Session expired. Please login again.');
            return;
        }

        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        try {
            await axios.post('https://water-distubution-system.onrender.com/api/features/wallet/topup', { amount }, config);
            toast.success(`Success! Added ₹${amount} to wallet.`);
            setShowTopupModal(false);
            fetchWalletData();
            fetchTransactions();
        } catch (error) {
            console.error('Topup error:', error);
            toast.error('Topup failed. Please try again.');
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchWalletData();
            fetchTransactions();
            fetchPrepaidPlans();
        }
    }, [user]);

    const fetchWalletData = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('https://water-distubution-system.onrender.com/api/wallet', config);
            if (data.success) {
                setWallet(data.wallet);
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
        }
    };

    const fetchTransactions = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('https://water-distubution-system.onrender.com/api/wallet/transactions', config);
            if (data.success) {
                setTransactions(data.transactions);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setLoading(false);
        }
    };

    const fetchPrepaidPlans = async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('https://water-distubution-system.onrender.com/api/wallet/plans', config);
            if (data.success) {
                setPrepaidPlans(data.plans);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const handleRecharge = async (planId = null) => {
        try {
            const amount = planId
                ? prepaidPlans.find(p => p._id === planId)?.amount
                : parseFloat(rechargeAmount);

            if (!amount || amount < 10) {
                alert('Minimum recharge amount is ₹10');
                return;
            }

            const config = { headers: { Authorization: `Bearer ${user?.token}` } };

            // Create Razorpay order
            const { data } = await axios.post(
                'http://localhost:5000/api/wallet/create-order',
                { amount, planId },
                config
            );

            if (!data.success) {
                alert('Failed to create payment order');
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
                    // Verify payment
                    try {
                        const verifyData = await axios.post(
                            'http://localhost:5000/api/wallet/verify-payment',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            config
                        );

                        if (verifyData.data.success) {
                            alert(`Payment successful! ₹${data.order.totalCredit} credited to wallet`);
                            setShowRechargeModal(false);
                            setRechargeAmount('');
                            setSelectedPlan(null);
                            fetchWalletData();
                            fetchTransactions();
                        }
                    } catch (error) {
                        alert('Payment verification failed');
                        console.error(error);
                    }
                },
                prefill: {
                    name: localStorage.getItem('userName') || '',
                    email: localStorage.getItem('userEmail') || '',
                },
                theme: {
                    color: '#0EA5E9',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            alert('Failed to initiate payment');
            console.error(error);
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'credit':
                return <TrendingUp className="text-green-500" size={20} />;
            case 'debit':
                return <TrendingDown className="text-red-500" size={20} />;
            default:
                return <RefreshCw className="text-blue-500" size={20} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 px-4 md:px-6 py-6 md:py-10">
            {/* Load Razorpay Script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6 md:mb-8 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3">
                    <WalletIcon className="text-sky-500" size={32} md:size={40} />
                    My Wallet
                </h1>
                <p className="text-sm md:text-slate-600 mt-2">Manage your digital wallet & transactions</p>
            </div>

            {/* Wallet Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto mb-8"
            >
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-sky-100 text-sm mb-2">Available Balance</p>
                            <h2 className="text-5xl font-bold">₹{wallet?.balance || 0}</h2>
                        </div>
                        <WalletIcon size={60} className="opacity-20" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                            <p className="text-sky-100 text-[10px] md:text-xs mb-1">Total Credited</p>
                            <p className="text-lg md:text-xl font-semibold">₹{wallet?.totalCredited || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                            <p className="text-sky-100 text-[10px] md:text-xs mb-1">Total Spent</p>
                            <p className="text-lg md:text-xl font-semibold">₹{wallet?.totalDebited || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                            <p className="text-sky-100 text-[10px] md:text-xs mb-1">Cashback Earned</p>
                            <p className="text-lg md:text-xl font-semibold flex items-center gap-1">
                                <Gift size={16} />
                                ₹{wallet?.totalCashback || 0}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowTopupModal(true)}
                        className="w-full bg-white text-sky-600 font-semibold py-3 rounded-xl hover:bg-sky-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles size={20} />
                        Recharge Wallet
                    </button>
                </div>
            </motion.div>

            {/* Prepaid Plans */}
            <div className="max-w-7xl mx-auto mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Prepaid Recharge Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {prepaidPlans.map((plan) => (
                        <motion.div
                            key={plan._id}
                            whileHover={{ scale: 1.05 }}
                            className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${plan.isPremium
                                ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-white'
                                : 'border-slate-200'
                                }`}
                        >
                            {plan.isPremium && (
                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                                    PREMIUM
                                </div>
                            )}
                            <h4 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h4>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-3xl font-bold text-sky-600">₹{plan.amount}</span>
                                <span className="text-sm text-slate-500 line-through">₹{plan.amount}</span>
                            </div>
                            <div className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-lg inline-block mb-4">
                                Get ₹{plan.bonusAmount} BONUS
                            </div>
                            <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                            <ul className="space-y-2 mb-6">
                                {plan.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="text-xs text-slate-600 flex items-start gap-2">
                                        <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleRecharge(plan._id)}
                                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-lg transition-all"
                            >
                                Recharge Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Transaction History */}
            <div className="max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Transaction History</h3>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <WalletIcon size={64} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-semibold">No transactions yet</p>
                            <p className="text-sm">Your transaction history will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transactions.slice(0, 10).map((txn) => (
                                <div key={txn._id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-100 rounded-full">
                                                {getTransactionIcon(txn.transactionType)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{txn.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    <Clock size={12} />
                                                    {new Date(txn.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className={`text-lg font-bold ${txn.transactionType === 'credit'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}
                                            >
                                                {txn.transactionType === 'credit' ? '+' : '-'}₹{txn.amount}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Balance: ₹{txn.balanceAfter}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Wallet Topup Modal */}
            <WalletTopupModal
                show={showTopupModal}
                onClose={() => setShowTopupModal(false)}
                onSubmit={handleConfirmTopup}
            />
        </div>
    );
};

export default WalletPage;
