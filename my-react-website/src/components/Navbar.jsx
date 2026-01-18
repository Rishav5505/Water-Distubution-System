import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, LogOut, User as UserIcon, LayoutDashboard, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Dashboard', path: user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor' : '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/profile', icon: UserIcon },
    ];

    return (
        <nav className="sticky top-0 z-[1000] px-4 md:px-6 py-4">
            <div className="max-w-7xl mx-auto backdrop-blur-2xl bg-slate-950/40 border border-white/10 rounded-2xl md:rounded-[2rem] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-2xl shadow-black/20">
                <Link to="/" className="flex items-center gap-2 md:gap-3 group">
                    <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        className="w-10 h-10 md:w-12 md:h-12 water-gradient rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30"
                    >
                        <Droplet className="text-white fill-white" size={22} />
                    </motion.div>
                    <div>
                        <span className="text-lg md:text-2xl font-black text-white tracking-tight block leading-none">JalConnect</span>
                        <span className="text-[8px] md:text-[10px] font-bold text-sky-400 uppercase tracking-[0.3em] block mt-1">Smart Water</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-2">
                    {user ? (
                        <>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={isActive(link.path) ? 'nav-link-active' : 'nav-link'}
                                >
                                    <link.icon size={20} />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            <div className="w-[1px] h-8 bg-white/10 mx-2" />
                            <div className="flex items-center gap-3 pl-2">
                                <div className="hidden lg:block text-right">
                                    <span className="text-xs font-bold text-white block">{user.name}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user.role}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary !py-2.5 !px-6 !text-sm">Get Started</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-3">
                    {!user && (
                        <Link to="/login" className="text-xs font-bold text-slate-400">Login</Link>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-72 bg-slate-950 border-l border-white/10 z-[999] p-6 md:hidden flex flex-col"
                        >
                            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                                <div className="w-10 h-10 water-gradient rounded-xl flex items-center justify-center">
                                    <Droplet className="text-white fill-white" size={20} />
                                </div>
                                <div>
                                    <span className="text-lg font-black text-white block">JalConnect</span>
                                    <span className="text-[8px] font-bold text-sky-400 uppercase tracking-widest">Mobile App</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                {user ? (
                                    <>
                                        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">User Profile</p>
                                            <p className="text-sm font-black text-white">{user.name}</p>
                                            <p className="text-[10px] text-sky-400 font-bold uppercase">{user.role}</p>
                                        </div>
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${isActive(link.path) ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 border border-transparent'}`}
                                            >
                                                <link.icon size={20} />
                                                <span>{link.name}</span>
                                            </Link>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 p-4 rounded-xl font-bold text-slate-400"
                                        >
                                            <UserIcon size={20} />
                                            <span>Login</span>
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="btn-primary w-full mt-4"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>

                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className="mt-auto flex items-center gap-3 p-4 rounded-xl font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10"
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
