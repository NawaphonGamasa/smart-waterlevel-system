import React, { useState, useEffect } from 'react';
import { Settings, Activity, Droplets, Zap, X, Maximize2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { saveSettings } from '../../services/api'; // ตรวจสอบ path ว่าถูกต้อง

// แก้ไขบรรทัดนี้: รับ Props แยกกันตามโครงสร้างเดิมของคุณ + เพิ่ม settings และ onRefresh
const StatusPanel = ({ waterData, historyData, settings, onRefresh }) => {

    // 1. State นาฬิกา
    const [timeStr, setTimeStr] = useState(new Date().toLocaleString('th-TH'));

    // 2. State Popup และ Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        start_val: 500, stop_val: 100, diff_val: 50,
        open_min: 2, open_sec: 30,
        close_min: 2, close_sec: 30
    });

    // --- Effect: เดินนาฬิกา ---
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setTimeStr(now.toLocaleString('th-TH', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // --- Effect: ดึงค่า Setting จาก Props มาใส่ Form ---
    useEffect(() => {
        // เช็คว่ามี settings ส่งมาจริงไหม และ popup เปิดอยู่ไหม
        if (settings && isModalOpen) {

            // ✅ แก้ไข: เปลี่ยน Logic เป็นการหารตัวเลข (วินาที -> นาที)
            const parseTime = (totalSeconds) => {
                const sec = Number(totalSeconds) || 0; // แปลงค่าเป็นตัวเลขให้ชัวร์
                return {
                    m: Math.floor(sec / 60), // หาร 60 เพื่อเอานาที
                    s: sec % 60              // หารเอาเศษ เพื่อเอาวินาที
                };
            };

            const openT = parseTime(settings.open_time_val);
            const closeT = parseTime(settings.close_time_val);

            setFormData({
                start_val: settings.start_val || 0,
                stop_val: settings.stop_val || 0,
                diff_val: settings.diff_val || 0,
                open_min: openT.m,
                open_sec: openT.s,
                close_min: closeT.m,
                close_sec: closeT.s
            });
        }
    }, [settings, isModalOpen]);

    // --- Handle: พิมพ์ค่า ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    };

    // --- Handle: บันทึก ---
    const handleSaveConfig = async () => {
        try {
            const payload = {
                start_val: formData.start_val,
                stop_val: formData.stop_val,
                diff_val: formData.diff_val,
                open_time_val: `${formData.open_min}:${formData.open_sec}`,
                close_time_val: `${formData.close_min}:${formData.close_sec}`
            };

            await saveSettings(payload);

            alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
            setIsModalOpen(true);

            // สั่งโหลดข้อมูลใหม่ (ถ้ามีฟังก์ชันส่งมา)
            if (onRefresh) onRefresh();

        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    // แปลงข้อมูลกราฟ (ใช้ historyData จาก Props โดยตรง)
    // เพิ่มการดัก Array ว่าง ([]) เพื่อป้องกัน error ตอนเริ่มโหลด
    const chartData = (historyData || []).slice().reverse().map(item => ({
        time: new Date(item.log_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        road: item.road_val,
        canal: item.canal_val
    }));

    // ดัก Error กรณี waterData ยังไม่มา
    const safeWater = waterData || { road_val: 0, canal_val: 0, q1_status: 0, q2_status: 0 };

    return (
        <div className="flex flex-col h-full bg-[#0B1121] text-white border-l border-gray-800 font-sans relative overflow-hidden select-none">

            {/* --- POPUP (Modal) --- */}
            {isModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1F2937] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <Settings size={18} className="text-blue-400" />
                                <h3 className="font-bold text-gray-100">ตั้งค่าเกณฑ์ควบคุม (LOGO! PLC)</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-6 text-left">
                            {/* Input Fields */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-green-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />ระดับน้ำถนนเริ่มทำงาน (Start)
                                </label>
                                <div className="flex gap-2">
                                    <input type="number" name="start_val" value={formData.start_val} onChange={handleChange} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono" />
                                    <button onClick={handleSaveConfig} className="w-24 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-red-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />ระดับน้ำถนนหยุดทำงาน (Stop)
                                </label>
                                <div className="flex gap-2">
                                    <input type="number" name="stop_val" value={formData.stop_val} onChange={handleChange} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono" />
                                    <button onClick={handleSaveConfig} className="w-24 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />เกณฑ์ผลต่างระดับน้ำ (Diff)
                                </label>
                                <div className="flex gap-2">
                                    <input type="number" name="diff_val" value={formData.diff_val} onChange={handleChange} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono" />
                                    <button onClick={handleSaveConfig} className="w-24 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-800">
                                <label className="text-sm font-semibold text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500" />เวลาปิดประตูน้ำ (Close Time)</label>
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 flex gap-2 items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-1">
                                        <input type="number" name="close_min" value={formData.close_min} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                        <span className="text-gray-600 font-bold">:</span>
                                        <input type="number" name="close_sec" value={formData.close_sec} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                    </div>
                                    <button onClick={handleSaveConfig} className="w-24 bg-gray-700 hover:bg-gray-600 rounded-xl py-2.5 text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-800">
                                <label className="text-sm font-semibold text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500" />เวลาเปิดประตูน้ำ (Open Time)</label>
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 flex gap-2 items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-1">
                                        <input type="number" name="open_min" value={formData.open_min} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                        <span className="text-gray-600 font-bold">:</span>
                                        <input type="number" name="open_sec" value={formData.open_sec} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                    </div>
                                    <button onClick={handleSaveConfig} className="w-24 bg-gray-700 hover:bg-gray-600 rounded-xl py-2.5 text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-800/30 border-t border-gray-700 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm text-white shadow-lg">ตกลง / ปิดหน้าต่าง</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="h-20 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-10">
                <div>
                    <h1 className="text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center gap-2"><Activity className="text-blue-500" /> SYSTEM STATUS</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                        <span className="text-[10px] text-green-500 font-bold tracking-[0.2em] uppercase">Online Monitoring</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-gray-200 tracking-wider">{timeStr.split(' ')[1]}</div>
                    <div className="text-xs text-gray-500 font-mono font-medium">{timeStr.split(' ')[0]}</div>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 z-10 custom-scrollbar display-none">
                {/* CARD 1 */}
                <div className="bg-gray-800/40 rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20"><Droplets size={20} /></div><h2 className="text-lg font-bold text-gray-200 tracking-wide">Road Water Level</h2></div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider ${safeWater.road_val > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{safeWater.road_val > 0 ? 'NORMAL' : 'FAULT'}</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div><span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">Sensor Value</span><div className="text-5xl font-mono font-bold text-white mt-1 tracking-tighter drop-shadow-lg">{safeWater.road_val.toFixed(1)}<span className="text-xl text-gray-500 ml-1 font-sans">%</span></div></div>
                        <div className="flex flex-col items-end gap-1 mb-1"><div className={`w-3 h-3 rounded-full transition-all duration-500 ${safeWater.road_val > 0 ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse'}`}></div><span className="text-[10px] text-gray-500 font-bold uppercase">Reading / Fault</span></div>
                    </div>
                </div>

                {/* CARD 2 (With Setting Button) */}
                <div className="bg-gray-800/40 rounded-2xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group shadow-lg relative">
                    <button className="absolute top-4 right-4 p-2 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-all" onClick={() => setIsModalOpen(true)}><Settings size={18} /></button>
                    <div className="flex items-center gap-3 mb-6"><div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20"><Droplets size={20} /></div><h2 className="text-lg font-bold text-gray-200 tracking-wide">Canal Water Level</h2></div>
                    <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/5">
                        <div><span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">Sensor Value</span><div className="text-5xl font-mono font-bold text-white mt-1 tracking-tighter drop-shadow-lg">{safeWater.canal_val.toFixed(1)}<span className="text-xl text-gray-500 ml-1 font-sans">%</span></div></div>
                        <div className="flex flex-col items-end gap-1 mb-1"><div className={`w-3 h-3 rounded-full transition-all duration-500 ${safeWater.canal_val > 0 ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse'}`}></div><span className="text-[10px] text-gray-500 font-bold uppercase">Reading / Fault</span></div>
                    </div>
                    {/* Gate Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${safeWater.q1_status === 1 ? 'bg-green-500 border-green-500/30' : 'bg-gray-900/50 border-white/5'}`}>
                            <div className="flex items-center gap-2"><Zap size={14} className={safeWater.q1_status === 1 ? 'text-red-400' : 'text-gray-600'} /><span className={`text-[10px] font-bold uppercase tracking-wider ${safeWater.q1_status === 1 ? 'text-red-100' : 'text-gray-500'}`}>Gate Open</span></div>
                            <div className={`w-3 h-3 rounded-full border-2 border-gray-800 transition-all duration-300 ${safeWater.q1_status === 1 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gray-700'}`}></div>
                        </div>
                        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${safeWater.q2_status === 1 ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-900/50 border-white/5'}`}>
                            <div className="flex items-center gap-2"><Zap size={14} className={safeWater.q2_status === 1 ? 'text-green-400' : 'text-gray-600'} /><span className={`text-[10px] font-bold uppercase tracking-wider ${safeWater.q2_status === 1 ? 'text-green-100' : 'text-gray-500'}`}>Gate Close</span></div>
                            <div className={`w-3 h-3 rounded-full border-2 border-gray-800 transition-all duration-300 ${safeWater.q2_status === 1 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-gray-700'}`}></div>
                        </div>
                    </div>
                </div>

                {/* CHART */}
                {/* 1. (แก้ไข) เพิ่ม relative group ที่บรรทัดนี้ */}
                <div className="bg-gray-800/40 rounded-2xl p-4 border border-white/5 h-64 flex flex-col shadow-inner relative group">

                    {/* 2. (เพิ่ม) ปุ่มสำหรับกดขยาย */}
                    <button
                        onClick={() => setIsChartModalOpen(true)}
                        className="absolute top-4 right-4 p-1.5 bg-gray-700/50 hover:bg-blue-600 text-gray-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"
                        title="ดูแบบเต็มจอ"
                    >
                        <Maximize2 size={16} />
                    </button>

                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} /> Real-time Trend (20 Log)</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                                    <linearGradient id="colorCanal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} /><stop offset="95%" stopColor="#ffffff" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => Number(value).toFixed(1)} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="road" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRoad)" />
                                <Area type="monotone" dataKey="canal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCanal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/* --- (ส่วนที่แทรกเพิ่ม) POPUP GRAHP MODAL --- */}
            {isChartModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1F2937] w-[95vw] h-[85vh] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <Activity size={24} className="text-blue-400" />
                                <h3 className="text-xl font-bold text-gray-100">Real-time Trend (Expanded View)</h3>
                            </div>
                            <button onClick={() => setIsChartModalOpen(false)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 p-6 bg-[#0B1121]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRoadBig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                                        <linearGradient id="colorCanalBig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} /><stop offset="95%" stopColor="#ffffff" stopOpacity={0} /></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={true} />
                                    <XAxis dataKey="time" stroke="#6b7280" fontSize={14} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#6b7280" fontSize={14} domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => Number(value).toFixed(0)} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '14px' }} />
                                    <Area type="monotone" dataKey="road" name="Road" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRoadBig)" />
                                    <Area type="monotone" dataKey="canal" name="Canal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCanalBig)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusPanel;