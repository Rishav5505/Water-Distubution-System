import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('jalconnect_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
            setUser(data);
            sessionStorage.setItem('jalconnect_user', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
                notVerified: error.response?.data?.notVerified,
                email: error.response?.data?.email
            };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/register`, userData);
            // Don't set user yet, wait for OTP
            return { success: true, message: data.message, email: data.email };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
            setUser(data);
            sessionStorage.setItem('jalconnect_user', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'OTP Verification failed'
            };
        }
    };

    const resendOTP = async (email) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/resend-otp`, { email });
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to resend OTP'
            };
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('jalconnect_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, verifyOTP, resendOTP, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
