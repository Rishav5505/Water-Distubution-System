import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { KeyRound, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const EmailVerification = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from location state (passed from login or register)
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            toast.error('Session expired. Please register again.');
            navigate('/register');
        }
    }, [email, navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Please enter 6-digit OTP');

        setLoading(true);
        const result = await verifyOTP(email, otp);
        setLoading(false);

        if (result.success) {
            toast.success('Account verified successfully!');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    const handleResendOTP = async () => {
        const result = await resendOTP(email);
        if (result.success) {
            toast.success('New OTP sent to your email!');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6 relative overflow-hidden text-white">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[130px] rounded-full -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md p-10 flex flex-col items-center"
            >
                <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mb-8 border border-sky-500/20">
                    <KeyRound className="text-sky-400" size={40} />
                </div>

                <h2 className="text-3xl font-black text-white mb-2 text-center">Verify Identity</h2>
                <p className="text-slate-400 text-center mb-10 text-sm">
                    Enter the verification code sent to <br />
                    <span className="text-sky-400 font-bold">{email}</span>
                </p>

                <form onSubmit={handleVerifyOTP} className="w-full space-y-8">
                    <div className="relative">
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
                        disabled={loading}
                        className="btn-primary w-full h-14"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Code'}
                    </button>

                    <div className="text-center space-y-6">
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <Mail size={16} /> Resend Verification Code
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-400 transition-colors uppercase tracking-widest mx-auto"
                        >
                            <ArrowLeft size={14} /> Back to Sign In
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EmailVerification;
