import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Droplet, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/');
        } else {
            if (result.notVerified) {
                toast.error('Account not verified. Please check your email.');
                navigate('/verify-email', { state: { email: result.email } });
            } else {
                toast.error(result.message);
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6 bg-transparent">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-[460px] relative overflow-hidden group p-6 md:p-8"
            >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50"></div>

                <div className="flex flex-col items-center mb-8 md:mb-10 text-center">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="w-16 h-16 md:w-20 md:h-20 water-gradient rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-sky-500/40 mb-4 md:mb-6 relative group-hover:scale-110 transition-transform duration-500"
                    >
                        <Droplet className="text-white fill-white" size={32} />
                        <div className="absolute inset-0 bg-white/20 rounded-2xl md:rounded-[2rem] animate-pulse"></div>
                    </motion.div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-xs md:text-sm text-slate-400 font-medium">Please enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                className="input-field pl-14"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                            <button type="button" className="text-[10px] font-bold text-sky-500 hover:text-sky-400 uppercase tracking-widest">Forgot?</button>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                className="input-field pl-14"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Sign In to Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </span>
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-slate-400 font-medium">
                        New to JalConnect? {' '}
                        <Link to="/register" className="text-sky-400 hover:text-sky-300 font-bold decoration-sky-500/30 underline-offset-4 hover:underline transition-all">
                            Create an account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
