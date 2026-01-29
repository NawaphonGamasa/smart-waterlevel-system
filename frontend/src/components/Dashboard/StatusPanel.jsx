import React, { useState, useEffect } from 'react';
import { Settings, Activity, Droplets, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatusPanel = ({ waterData, historyData }) => {
    // 1. State สำหรับนาฬิกา
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const formatted = now.toLocaleString('th-TH', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            });
            setTimeStr(formatted);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // แปลงข้อมูลกราฟ
    const chartData = [...historyData].reverse().map(item => ({
        time: new Date(item.log_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        road: item.road_val,
        canal: item.canal_val
    }));

    return (
        <div className="flex flex-col h-full bg-[#0B1121] text-white border-l border-gray-800 font-sans relative overflow-hidden select-none">

            {/* Background Effect (แสงพื้นหลังจางๆ) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 blur-[100px] pointer-events-none" />

            {/* --- HEADER --- */}
            <div className="h-20 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-10">
                <div>
                    <h1 className="text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center gap-2">
                        <Activity className="text-blue-500" /> SYSTEM STATUS
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] text-green-500 font-bold tracking-[0.2em] uppercase">Online Monitoring</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-gray-200 tracking-wider">{timeStr.split(' ')[1]}</div>
                    <div className="text-xs text-gray-500 font-mono font-medium">{timeStr.split(' ')[0]}</div>
                </div>
            </div>

            {/* --- CONTENT SCROLL AREA --- */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 z-10 custom-scrollbar display-none">

                {/* === CARD 1: ROAD WATER LEVEL === */}
                <div className="bg-gray-800/40 rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-all">
                                <Droplets size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-gray-200 tracking-wide">Road Water Level</h2>
                        </div>
                        {/* Status Label */}
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider ${waterData.road_val > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {waterData.road_val > 0 ? 'NORMAL' : 'FAULT'}
                        </div>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">Sensor Value</span>
                            <div className="text-5xl font-mono font-bold text-white mt-1 tracking-tighter drop-shadow-lg">
                                {waterData.road_val.toFixed(1)}<span className="text-xl text-gray-500 ml-1 font-sans">%</span>
                            </div>
                        </div>
                        {/* Status Light */}
                        <div className="flex flex-col items-end gap-1 mb-1">
                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${waterData.road_val > 0 ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse'}`}></div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Reding / Fault</span>
                        </div>
                    </div>
                </div>

                {/* === CARD 2: CANAL WATER LEVEL === */}
                <div className="bg-gray-800/40 rounded-2xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group shadow-lg relative">
                    <button
                        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        onClick={() => alert("Settings")}
                    >
                        <Settings size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20 transition-all">
                            <Droplets size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-200 tracking-wide">Canal Water Level</h2>
                    </div>

                    {/* Value Display */}
                    <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/5">
                        <div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">Sensor Value</span>
                            <div className="text-5xl font-mono font-bold text-white mt-1 tracking-tighter drop-shadow-lg">
                                {waterData.canal_val.toFixed(1)}<span className="text-xl text-gray-500 ml-1 font-sans">%</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 mb-1">
                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${waterData.canal_val > 0 ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse'}`}></div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Reding / Fault</span>
                        </div>
                    </div>

                    {/* Gate Control Status Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Gate Open Indicator */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${waterData.q1_status === 1 ? 'bg-green-500 border-green-500/30' : 'bg-gray-900/50 border-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={waterData.q1_status === 1 ? 'text-red-400' : 'text-gray-600'} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${waterData.q1_status === 1 ? 'text-red-100' : 'text-gray-500'}`}>Gate Open</span>
                            </div>
                            <div className={`w-3 h-3 rounded-full border-2 border-gray-800 transition-all duration-300 ${waterData.q1_status === 1 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gray-700'}`}></div>
                        </div>

                        {/* Gate Close Indicator */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${waterData.q2_status === 1 ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-900/50 border-white/5'}`}>
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={waterData.q2_status === 1 ? 'text-green-400' : 'text-gray-600'} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${waterData.q2_status === 1 ? 'text-green-100' : 'text-gray-500'}`}>Gate Close</span>
                            </div>
                            <div className={`w-3 h-3 rounded-full border-2 border-gray-800 transition-all duration-300 ${waterData.q2_status === 1 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-700'}`}></div>
                        </div>
                    </div>
                </div>

                {/* === CHART SECTION === */}
                <div className="bg-gray-800/40 rounded-2xl p-4 border border-white/5 h-64 flex flex-col shadow-inner">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={14} /> Real-time Trend (20 Log)
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCanal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => Number(value).toFixed(1)}/>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#e5e7eb', fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#9ca3af', fontSize: '10px', marginBottom: '8px', letterSpacing: '0.05em' }}
                                    formatter={(value) => Number(value).toFixed(1)}
                                />
                                <Area type="monotone" dataKey="road" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRoad)" name="Road" />
                                <Area type="monotone" dataKey="canal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCanal)" name="Canal" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StatusPanel;