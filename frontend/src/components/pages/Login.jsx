import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff} from 'lucide-react';
import { loginUser } from '../../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await loginUser(username, password);
            if (res.status == 'success') {
                localStorage.setItem('token', res.token);
                localStorage.setItem('role', res.role);
                localStorage.setItem('username', res.username);

                navigate('/');
            }
        } catch (err) {
            setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 1. Background Container
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative font-sans"
            style={{ backgroundImage: "url('/assets/login-bg.jpg')" }}
        >
            <div className="absolute inset-0 bg-[#1a233ae0]"></div>

            {/* 2. Login Card */}
            <div className="relative z-10 w-full max-w-[500px] bg-[#f5f5f5] rounded-[30px] shadow-2xl flex overflow-hidden min-h-[400px]">

                <div className="w-5 bg-[#e00000] h-full absolute left-8 top-0"></div>

                {/* Form Container */}
                <div className="flex-1 px-10 py-12 ml-4 flex flex-col items-center">

                    {/* Logo Area */}
                    <div className="mb-10 flex flex-col items-center">
                        <img src="/assets/scg-logo.png" alt="SCG Logo" className="h-12" />
                    </div>

                    {/* Form Input */}
                    <form onSubmit={handleLogin} className="w-full space-y-5">

                        {/* Username Input */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800">
                                <User size={24} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full py-3.5 pl-14 pr-6 rounded-full bg-white text-gray-700 font-medium shadow-sm border-2 border-transparent focus:border-red-600 outline-none transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800">
                                <Lock size={24} strokeWidth={2.5} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-3.5 pl-14 pr-12 rounded-full bg-white text-gray-700 font-medium shadow-sm border-2 border-transparent focus:border-red-600 outline-none transition-all placeholder:text-gray-400"
                                required
                            />
                            {/* Toggle Eye Icon */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-600 text-sm text-center font-semibold bg-red-100 py-1 px-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#a70101] hover:bg-[#8f0101] text-white font-bold text-lg py-3 rounded-[10px] shadow-lg mt-4 transition-all transform disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Login'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;