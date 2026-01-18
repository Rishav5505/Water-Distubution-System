import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, LogOut, User as UserIcon, LayoutDashboard, Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-[1000] px-6 py-4">
            <div className="max-w-7xl mx-auto backdrop-blur-2xl bg-slate-950/40 border border-white/10 rounded-[2rem] px-8 py-4 flex items-center justify-between shadow-2xl shadow-black/20">
                <Link to="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        className="w-12 h-12 water-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30"
                    >
                        <Droplet className="text-white fill-white" size={26} />
                    </motion.div>
                    <div>
                        <span className="text-2xl font-black text-white tracking-tight block leading-none">JalConnect</span>
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.3em] block mt-1">Smart Water</span>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link
                                to={user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/dashboard'}
                                className={isActive('/dashboard') || isActive('/admin') || isActive('/vendor') ? 'nav-link-active' : 'nav-link'}
                            >
                                <LayoutDashboard size={20} />
                                <span className="hidden md:inline">Dashboard</span>
                            </Link>

                            <Link to="/profile" className={isActive('/profile') ? 'nav-link-active' : 'nav-link'}>
                                <UserIcon size={20} />
                                <span className="hidden md:inline">Profile</span>
                            </Link>

                            <div className="w-[1px] h-8 bg-white/10 mx-2 hidden md:block" />

                            <div className="flex items-center gap-3 pl-2">
                                <div className="hidden lg:block text-right">
                                    <span className="text-xs font-bold text-white block">{user.name}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user.role}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary !py-2.5 !px-6 !text-sm">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
