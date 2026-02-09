import React, { useState, useEffect } from 'react';
import { Settings, Activity, Droplets, Zap, X, Maximize2, FileText, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { saveSettings, getDailyReport } from '../../services/api'; // ตรวจสอบ path ว่าถูกต้อง

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
    // --- [แก้ไขจุดนี้] State สำหรับช่วงวันที่ ---
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // วันเริ่ม
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);     // วันสิ้นสุด
    const [reportData, setReportData] = useState([]);
    const [reportSummary, setReportSummary] = useState({ avg_road: 0, avg_canal: 0, total_records: 0 });
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    // --- [แก้ไขจุดนี้] ฟังก์ชันดึงข้อมูลแบบส่ง 2 ค่า ---
    const fetchReport = async () => {
        setIsLoadingReport(true);
        try {
            // ส่งทั้ง startDate และ endDate
            const result = await getDailyReport(startDate, endDate);

            if (result.status === 'success') {
                setReportData(result.data);
                setReportSummary(result.summary);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error(error);
            setReportData([]);
        } finally {
            setIsLoadingReport(false);
        }
    };

    // โหลดข้อมูลเมื่อเปิด Modal หรือเปลี่ยนวันที่ใดวันที่หนึ่ง
    useEffect(() => {
        if (isReportModalOpen) {
            fetchReport();
        }
    }, [isReportModalOpen, startDate, endDate]);
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
        road: item.road_val.toFixed(1),
        canal: item.canal_val.toFixed(1)
    }));

    // ดัก Error กรณี waterData ยังไม่มา
    const safeWater = waterData || { road_val: 0, canal_val: 0, q1_status: 0, q2_status: 0 };

    return (
        <div className="flex flex-col h-full bg-[#0B1121] text-white border-t lg:border-t-0 lg:border-l border-gray-800 font-sans relative overflow-hidden select-none">
            {/* --- REPORT MODAL --- */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 lg:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    {/* ✅ ปรับ Modal: มือถือเต็มจอ (h-full w-full rounded-none), จอใหญ่เป็น Card (h-[80vh] rounded-2xl) */}
                    <div className="bg-[#1F2937] w-full h-full lg:max-w-4xl lg:h-[80vh] lg:rounded-2xl border-none lg:border border-gray-700 shadow-2xl overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50 gap-4 sm:gap-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg"><FileText size={24} className="text-purple-400" /></div>
                                <div><h3 className="text-lg sm:text-xl font-bold text-gray-100">รายงานสรุปช่วงเวลา</h3></div>
                            </div>

                            <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-2">
                                {/* ส่วนเลือกวันที่ */}
                                <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700 overflow-x-auto">
                                    <span className="text-xs text-gray-500 font-bold whitespace-nowrap">FROM</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent text-white text-xs sm:text-sm focus:outline-none font-mono"
                                    />
                                    <span className="text-gray-600">|</span>
                                    <span className="text-xs text-gray-500 font-bold whitespace-nowrap">TO</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent text-white text-xs sm:text-sm focus:outline-none font-mono"
                                    />
                                </div>

                                <button onClick={() => setIsReportModalOpen(false)} className="ml-2 sm:ml-4 p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white"><X size={24} /></button>
                            </div>
                        </div>

                        {/* Body (ตารางข้อมูล) */}
                        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 gap-4 sm:gap-6">
                            {/* Summary Cards */}
                            {/* ✅ ปรับ Grid: มือถือ 1 ช่อง, จอใหญ่ 3 ช่อง */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex justify-between sm:block items-center">
                                    <p className="text-xs text-gray-400 uppercase">Total Records</p>
                                    <p className="text-xl sm:text-2xl font-mono font-bold text-white mt-0 sm:mt-1">{reportSummary.total_records}</p>
                                </div>
                                <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30 flex justify-between sm:block items-center">
                                    <p className="text-xs text-blue-300 uppercase">Avg Road Level</p>
                                    <p className="text-xl sm:text-2xl font-mono font-bold text-blue-400 mt-0 sm:mt-1">{reportSummary.avg_road}%</p>
                                </div>
                                <div className="bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30 flex justify-between sm:block items-center">
                                    <p className="text-xs text-cyan-300 uppercase">Avg Canal Level</p>
                                    <p className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 mt-0 sm:mt-1">{reportSummary.avg_canal}%</p>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                                {/* ✅ เพิ่ม min-w-[600px] และ overflow-x-auto เพื่อให้ตารางเลื่อนได้ในมือถือ ไม่บีบจนเละ */}
                                <div className="overflow-x-auto">
                                    <div className="min-w-[600px]">
                                        <div className="grid grid-cols-5 bg-gray-800 p-3 text-sm font-bold text-gray-300 border-b border-gray-700">
                                            <div>Date/Time</div>
                                            <div className="text-center">Road (%)</div>
                                            <div className="text-center">Canal (%)</div>
                                            <div className="text-right">Gate Open Status</div>
                                            <div className="text-right">Gate Close Status</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 max-h-[40vh] sm:max-h-full">
                                        <div className="min-w-[600px]">
                                            {isLoadingReport ? <div className="text-center py-10 text-gray-500 animate-pulse">Loading...</div> :
                                                reportData.length === 0 ? <div className="text-center py-10 text-gray-500">No data found</div> :
                                                    reportData.map((row, i) => (
                                                        <div key={i} className="grid grid-cols-5 p-3 text-sm border-b border-gray-800 hover:bg-white/5">
                                                            <div className="font-mono text-gray-400 text-xs">
                                                                {new Date(row.log_time).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })} <span className="text-gray-500">|</span> {new Date(row.log_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="text-center font-mono text-blue-400">{Number(row.road_val).toFixed(1)}</div>
                                                            <div className="text-center font-mono text-cyan-400">{Number(row.canal_val).toFixed(1)}</div>
                                                            <div className="text-right text-[10px] text-green-400">
                                                                {row.q1_status === 1 ? 'Q1 ON ' : 'Q1 OFF'}
                                                            </div>
                                                            <div className="text-right text-[10px] text-red-400">
                                                                {row.q2_status === 1 ? 'Q2 ON ' : 'Q2 OFF'}
                                                            </div>
                                                        </div>
                                                    ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- POPUP (Setting Modal) --- */}
            {isModalOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1F2937] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-full overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <Settings size={18} className="text-blue-400" />
                                <h3 className="font-bold text-gray-100 text-sm sm:text-base">ตั้งค่าเกณฑ์ควบคุม (PLC)</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 text-left">
                            {/* Input Fields */}
                            {/* ใช้ Loop หรือ Copy เดิม แต่ปรับ padding/margin เล็กน้อยสำหรับมือถือ (Code เดิมใช้ได้ดีอยู่แล้วเพราะ Flex) */}
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-green-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />ระดับน้ำถนนเริ่มทำงาน (Start)
                                </label>
                                <div className="flex gap-2">
                                    <input type="number" name="start_val" value={formData.start_val} onChange={handleChange} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white font-mono text-sm" />
                                    <button onClick={handleSaveConfig} className="w-20 sm:w-24 bg-green-600 hover:bg-green-500 rounded-xl text-xs sm:text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-red-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />ระดับน้ำถนนหยุดทำงาน (Stop)
                                </label>
                                <div className="flex gap-2">
                                    <input type="number" name="stop_val" value={formData.stop_val} onChange={handleChange} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white font-mono text-sm" />
                                    <button onClick={handleSaveConfig} className="w-20 sm:w-24 bg-red-600 hover:bg-red-500 rounded-xl text-xs sm:text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                            {/* ... (Diff และ Timer ใช้ pattern เดียวกัน) ... */}
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-blue-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />เกณฑ์ผลต่างระดับน้ำ (Diff)
                                </label>
                                <div className="flex gap-2">
                                    <input type="number" name="diff_val" value={formData.diff_val} onChange={handleChange} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white font-mono text-sm" />
                                    <button onClick={handleSaveConfig} className="w-20 sm:w-24 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs sm:text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                             {/* Timer Sections - ปรับ button size เล็กน้อย */}
                             <div className="space-y-2 pt-2 border-t border-gray-800">
                                <label className="text-xs sm:text-sm font-semibold text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500" />เวลาปิดประตูน้ำ (Close)</label>
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 flex gap-2 items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-1">
                                        <input type="number" name="close_min" value={formData.close_min} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                        <span className="text-gray-600 font-bold">:</span>
                                        <input type="number" name="close_sec" value={formData.close_sec} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                    </div>
                                    <button onClick={handleSaveConfig} className="w-20 sm:w-24 bg-gray-700 hover:bg-gray-600 rounded-xl py-2.5 text-xs sm:text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-800">
                                <label className="text-xs sm:text-sm font-semibold text-gray-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500" />เวลาเปิดประตูน้ำ (Open)</label>
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 flex gap-2 items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-1">
                                        <input type="number" name="open_min" value={formData.open_min} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                        <span className="text-gray-600 font-bold">:</span>
                                        <input type="number" name="open_sec" value={formData.open_sec} onChange={handleChange} className="w-full bg-transparent py-2 text-center font-mono text-white outline-none" />
                                    </div>
                                    <button onClick={handleSaveConfig} className="w-20 sm:w-24 bg-gray-700 hover:bg-gray-600 rounded-xl py-2.5 text-xs sm:text-sm font-bold text-white">บันทึก</button>
                                </div>
                            </div>

                        </div>
                        <div className="p-4 bg-gray-800/30 border-t border-gray-700 flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm text-white shadow-lg">ปิดหน้าต่าง</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            {/* ✅ ปรับความสูง: h-16 (มือถือ) -> lg:h-20 (จอใหญ่) */}
            <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-10 flex-shrink-0">
                <div>
                    {/* ✅ ปรับขนาด Font Title */}
                    <h1 className="text-lg lg:text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center gap-2"><Activity className="text-blue-500 w-5 h-5 lg:w-6 lg:h-6" /> SYSTEM STATUS</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                        <span className="text-[10px] text-green-500 font-bold tracking-[0.2em] uppercase">Online Monitoring</span>
                    </div>
                </div>
                <div className="text-right">
                    {/* ✅ ปรับขนาด Font Clock */}
                    <div className="text-xl lg:text-2xl font-mono font-bold text-gray-200 tracking-wider">{timeStr.split(' ')[1]}</div>
                    <div className="text-[10px] lg:text-xs text-gray-500 font-mono font-medium">{timeStr.split(' ')[0]}</div>
                </div>
            </div>

            {/* --- CONTENT --- */}
            {/* ✅ ปรับ padding: p-3 (มือถือ) -> p-5 (จอใหญ่) */}
            <div className="flex-1 overflow-y-auto p-3 lg:p-5 space-y-3 lg:space-y-5 z-10 custom-scrollbar">
                
                {/* CARD 1: Road */}
                <div className="bg-gray-800/40 rounded-2xl p-4 lg:p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group shadow-lg">
                    <div className="flex justify-between items-start mb-2 lg:mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20"><Droplets size={20} /></div>
                            <h2 className="text-base lg:text-lg font-bold text-gray-200 tracking-wide">Road Water Level</h2>
                        </div>
                        <div className={`whitespace-nowrap w-fit h-fit px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider ${safeWater.road_val > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{safeWater.road_val > 0 ? 'NORMAL' : 'FAULT'}</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">Sensor Value</span>
                            {/* ✅ ปรับขนาด Font Value: text-4xl (มือถือ) -> text-5xl (จอใหญ่) */}
                            <div className="text-4xl lg:text-5xl font-mono font-bold text-white mt-1 tracking-tighter drop-shadow-lg">{safeWater.road_val.toFixed(1)}<span className="text-base lg:text-xl text-gray-500 ml-1 font-sans">%</span></div>
                        </div>
                        <div className="flex flex-col items-end gap-1 mb-1"><div className={`w-3 h-3 rounded-full transition-all duration-500 ${safeWater.road_val > 0 ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse'}`}></div><span className="text-[10px] text-gray-500 font-bold uppercase">Reading / Fault</span></div>
                    </div>
                </div>

                {/* CARD 2: Canal */}
                <div className="bg-gray-800/40 rounded-2xl p-4 lg:p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group shadow-lg relative">
                    <button className="absolute top-4 right-4 p-2 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-all" onClick={() => setIsModalOpen(true)}><Settings size={18} /></button>
                    <div className="flex justify-between items-start mb-2 lg:mb-4 pr-10">
                        <div className="flex items-center gap-3 mb-4 lg:mb-6">
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20"><Droplets size={20} /></div>
                            <h2 className="text-base lg:text-lg font-bold text-gray-200 tracking-wide">Canal Water Level</h2>
                        </div>
                        <div className={`whitespace-nowrap w-fit h-fit px-3 py-1 rounded-full text-[10px] font-bold border tracking-wider ${safeWater.canal_val > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{safeWater.canal_val > 0 ? 'NORMAL' : 'FAULT'}</div>
                    </div>
                    <div className="flex items-end justify-between mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-white/5">
                        <div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">Sensor Value</span>
                             {/* ✅ ปรับขนาด Font Value */}
                            <div className="text-4xl lg:text-5xl font-mono font-bold text-white mt-1 tracking-tighter drop-shadow-lg">{safeWater.canal_val.toFixed(1)}<span className="text-base lg:text-xl text-gray-500 ml-1 font-sans">%</span></div>
                        </div>
                        <div className="flex flex-col items-end gap-1 mb-1"><div className={`w-3 h-3 rounded-full transition-all duration-500 ${safeWater.canal_val > 0 ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse'}`}></div><span className="text-[10px] text-gray-500 font-bold uppercase">Reading / Fault</span></div>
                    </div>
                    {/* Gate Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${safeWater.q1_status === 1 ? 'bg-green-700 border-green-500/30' : 'bg-gray-900/50 border-white/5'}`}>
                            <div className="flex items-center gap-2"><Zap size={14} className={safeWater.q1_status === 1 ? 'text-green-400' : 'text-gray-600'} /><span className={`text-[10px] font-bold uppercase tracking-wider ${safeWater.q1_status === 1 ? 'text-green-100' : 'text-gray-500'}`}>Gate Open</span></div>
                            <div className={`w-3 h-3 rounded-full border-2 border-gray-800 transition-all duration-300 ${safeWater.q1_status === 1 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gray-700'}`}></div>
                        </div>
                        <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${safeWater.q2_status === 1 ? 'bg-green-700 border-green-500/30' : 'bg-gray-900/50 border-white/5'}`}>
                            <div className="flex items-center gap-2"><Zap size={14} className={safeWater.q2_status === 1 ? 'text-green-400' : 'text-gray-600'} /><span className={`text-[10px] font-bold uppercase tracking-wider ${safeWater.q2_status === 1 ? 'text-green-100' : 'text-gray-500'}`}>Gate Close</span></div>
                            <div className={`w-3 h-3 rounded-full border-2 border-gray-800 transition-all duration-300 ${safeWater.q2_status === 1 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-gray-700'}`}></div>
                        </div>
                    </div>
                </div>

                {/* CHART */}
                {/* ✅ ปรับความสูง: h-56 (มือถือ) -> h-64 (จอใหญ่) */}
                <div className="bg-gray-800/40 rounded-2xl p-4 border border-white/5 h-56 lg:h-64 flex flex-col shadow-inner relative group">
                    <button
                        onClick={() => setIsChartModalOpen(true)}
                        className="absolute top-4 right-4 p-1.5 bg-gray-700/50 hover:bg-blue-600 text-gray-400 hover:text-white rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-20"
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
                                <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => Number(value).toFixed(0)} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="road" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRoad)" />
                                <Area type="monotone" dataKey="canal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCanal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* --- REPORT BUTTON --- */}
                <div>
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-600 border border-blue-500/50 hover:border-blue-500 text-white-300 hover:text-white rounded-xl transition-all duration-300 group shadow-lg shadow-blue-900/20 w-full lg:w-auto justify-center lg:justify-start"
                    >
                        <FileText size={18} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-semibold text-sm tracking-wide">Report</span>
                    </button>
                </div>
            </div>


            {/* --- POPUP GRAHP MODAL --- */}
            {isChartModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 lg:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                     {/* ✅ ปรับ Chart Modal: มือถือเต็มจอ */}
                    <div className="bg-[#1F2937] w-full h-full lg:w-[95vw] lg:h-[85vh] rounded-none lg:rounded-2xl border-none lg:border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <Activity size={24} className="text-blue-400" />
                                <h3 className="text-lg lg:text-xl font-bold text-gray-100">Real-time Trend (Expanded View)</h3>
                            </div>
                            <button onClick={() => setIsChartModalOpen(false)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 p-2 lg:p-6 bg-[#0B1121]">
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