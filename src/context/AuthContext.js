import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Optionally fetch user profile here
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (username, password) => {
        const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
        setToken(response.data.access_token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.access_token);
    };

    const signup = async (username, email, password) => {
        await axios.post('http://localhost:5000/api/auth/signup', { username, email, password });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
