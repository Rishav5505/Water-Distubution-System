import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, X, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const ChatBox = ({ currentUser, receiverId, receiverName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const scrollRef = useRef();

    const API_URL = 'https://water-distubution-system.onrender.com/api';
    const SOCKET_URL = 'https://water-distubution-system.onrender.com';

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            auth: { token: currentUser.token }
        });
        setSocket(newSocket);

        newSocket.on('new_message', (msg) => {
            if (msg.sender._id === receiverId || msg.sender === receiverId) {
                setMessages(prev => [...prev, msg]);
            }
        });

        fetchMessages();

        return () => newSocket.disconnect();
    }, [receiverId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            const { data } = await axios.get(`${API_URL}/chat/${receiverId}`, config);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
            const { data } = await axios.post(`${API_URL}/chat`, {
                receiverId,
                content: newMessage
            }, config);

            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-96 h-full md:h-[500px] md:glass-card bg-slate-950 md:bg-transparent shadow-2xl z-[1001] flex flex-col md:overflow-hidden md:border-sky-500/20 md:rounded-[2rem]"
        >
            {/* Header */}
            <div className="p-4 bg-sky-500 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">{receiverName}</p>
                        <p className="text-[10px] text-sky-100 uppercase tracking-widest">Internal Support Chat</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <MessageCircle size={48} />
                        <p className="text-xs font-bold mt-2 uppercase tracking-widest">No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.sender === currentUser._id || msg.sender._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === currentUser._id || msg.sender._id === currentUser._id
                                    ? 'bg-sky-500 text-white rounded-tr-none shadow-lg shadow-sky-500/20'
                                    : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                                    }`}
                            >
                                {msg.content}
                                <p className={`text-[9px] mt-1 opacity-60 ${msg.sender === currentUser._id || msg.sender._id === currentUser._id ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                    type="submit"
                    className="p-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
                >
                    <Send size={18} />
                </button>
            </form>
        </motion.div>
    );
};

export default ChatBox;
