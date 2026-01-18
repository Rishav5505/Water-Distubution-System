import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallApp = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-6 right-6 z-[2000] md:left-auto md:w-80"
            >
                <div className="glass-card !p-4 border-sky-500/30 flex items-center justify-between gap-4 shadow-2xl shadow-sky-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 water-gradient rounded-xl flex items-center justify-center shrink-0">
                            <Download className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Install JalConnect</p>
                            <p className="text-[10px] text-slate-400">Get a faster experience on your home screen</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                        >
                            Install
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallApp;
