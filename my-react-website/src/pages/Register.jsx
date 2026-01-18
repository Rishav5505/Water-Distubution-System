import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Droplet, Mail, Lock, User, Building2, Home, Loader2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        towerNumber: '',
        flatNumber: '',
        role: 'user',
        society: '',
        societies: []
    });
    const [loading, setLoading] = useState(false);
    const [societies, setSocieties] = useState([]);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const { register, verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();

    const API_URL = 'https://water-distubution-system.onrender.com/api';

    useEffect(() => {
        const fetchSocieties = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/auth/societies`);
                setSocieties(data);
            } catch (error) {
                console.error("Failed to fetch societies");
            }
        };
        fetchSocieties();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const dataToSend = { ...formData };
        if (dataToSend.role === 'vendor') {
            delete dataToSend.society;
        } else {
            delete dataToSend.societies;
        }

        const result = await register(dataToSend);
        setLoading(false);

        if (result.success) {
            toast.success('OTP sent to your email!');
            setShowOTP(true);
        } else {
            toast.error(result.message);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Please enter 6-digit OTP');

        setVerifying(true);
        const result = await verifyOTP(formData.email, otp);
        setVerifying(false);

        if (result.success) {
            toast.success('Account verified and created!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    const handleResendOTP = async () => {
        const result = await resendOTP(formData.email);
        if (result.success) {
            toast.success('OTP Resent!');
        } else {
            toast.error(result.message);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocietySelect = (e) => {
        const value = e.target.value;
        const currentSocieties = formData.societies || [];

        if (currentSocieties.includes(value)) {
            setFormData({ ...formData, societies: currentSocieties.filter(id => id !== value) });
        } else {
            setFormData({ ...formData, societies: [...currentSocieties, value] });
        }
    };

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6 py-20 relative overflow-hidden text-white">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 blur-[150px] rounded-full -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-2xl relative"
            >
                {!showOTP ? (
                    <>
                        <div className="flex flex-col items-center mb-12">
                            <div className="w-20 h-20 water-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-sky-500/30 mb-6 group cursor-pointer">
                                <Droplet className="text-white fill-white group-hover:scale-110 transition-transform duration-500" size={36} />
                            </div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3 text-center leading-tight">Create your account</h1>
                            <p className="text-slate-400 font-medium text-center max-w-md">Join the smarter way of managing water delivery for your flat</p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={20} />
                                    <input
                                        name="name"
                                        type="text"
                                        className="input-field pl-14"
                                        placeholder="Ex: Rajesh Kumar"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={20} />
                                    <input
                                        name="email"
                                        type="email"
                                        className="input-field pl-14"
                                        placeholder="rajesh@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={20} />
                                    <input
                                        name="password"
                                        type="password"
                                        className="input-field pl-14"
                                        placeholder="••••••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">I am a...</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={20} />
                                    <select
                                        name="role"
                                        className="input-field pl-14 appearance-none text-white bg-slate-900"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="user">Resident / Society Member</option>
                                        <option value="vendor">Water Vendor / Partner</option>
                                        <option value="guard">Security Guard (Gate Pass)</option>
                                    </select>
                                </div>
                            </div>

                            <div className={`space-y-2 ${formData.role === 'vendor' ? 'md:col-span-2' : ''}`}>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    {formData.role === 'vendor' ? 'Select Delivery Areas (Multiple)' : 'Select Society'}
                                </label>
                                <div className="relative group">
                                    {formData.role === 'vendor' ? (
                                        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 max-h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 text-white">
                                            {societies.map(society => (
                                                <label key={society._id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        value={society._id}
                                                        checked={(formData.societies || []).includes(society._id)}
                                                        onChange={handleSocietySelect}
                                                        className="w-5 h-5 rounded border-slate-600 text-sky-500 focus:ring-sky-500 bg-slate-800"
                                                    />
                                                    <span className="text-slate-300 text-sm font-medium">{society.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={20} />
                                            <select
                                                name="society"
                                                className="input-field pl-14 appearance-none text-white bg-slate-900"
                                                value={formData.society}
                                                onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                                                required={formData.role !== 'admin'}
                                            >
                                                <option value="">Select your society...</option>
                                                {societies.map(society => (
                                                    <option key={society._id} value={society._id}>
                                                        {society.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {formData.role === 'user' && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Tower Number</label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={20} />
                                                <input
                                                    name="towerNumber"
                                                    type="text"
                                                    className="input-field pl-14"
                                                    placeholder="Ex: Tower B"
                                                    value={formData.towerNumber}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Flat Number</label>
                                            <div className="relative group">
                                                <Home className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={20} />
                                                <input
                                                    name="flatNumber"
                                                    type="text"
                                                    className="input-field pl-14"
                                                    placeholder="Ex: 1204"
                                                    value={formData.flatNumber}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>

                            <div className="md:col-span-2 mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full shadow-2xl shadow-sky-500/20"
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>Create Secure Account <ArrowRight size={20} /></>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="py-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mb-8 border border-sky-500/20">
                            <KeyRound className="text-sky-400" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">Verify your email</h2>
                        <p className="text-slate-400 text-center mb-10 max-w-sm">
                            We've sent a 6-digit verification code to <span className="text-sky-400 font-bold">{formData.email}</span>. Please enter it below.
                        </p>

                        <form onSubmit={handleVerifyOTP} className="w-full max-w-sm space-y-8">
                            <div className="relative group">
                                <input
                                    autoFocus
                                    type="text"
                                    maxLength={6}
                                    placeholder="0 0 0 0 0 0"
                                    className="input-field text-center text-4xl tracking-[0.5em] font-black h-20"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={verifying}
                                className="btn-primary w-full h-14"
                            >
                                {verifying ? <Loader2 className="animate-spin" size={24} /> : 'Verify & Continue'}
                            </button>

                            <div className="text-center space-y-4">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                    Didn't receive a code? Resend OTP
                                </button>
                                <br />
                                <button
                                    type="button"
                                    onClick={() => setShowOTP(false)}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-400 transition-colors uppercase tracking-widest"
                                >
                                    Change Email Address
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {!showOTP && (
                    <div className="mt-12 pt-10 border-t border-white/5 text-center">
                        <p className="text-slate-400 font-medium">
                            Already a member? {' '}
                            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-bold decoration-sky-500/30 underline-offset-4 hover:underline transition-all">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Register;
