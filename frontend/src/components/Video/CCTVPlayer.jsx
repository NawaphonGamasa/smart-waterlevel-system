import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, ImageOff } from 'lucide-react';

const CCTVPlayer = ({ url, label }) => {
    // สร้าง URL ที่มี Timestamp ต่อท้ายเพื่อป้องกัน Browser จำรูปเดิม (Cache Busting)
    const getTimestampedUrl = (src) => {
        if (!src) return '';
        // เช็คว่าใน URL มีเครื่องหมาย ? หรือยัง
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}t=${new Date().getTime()}`;
    };

    const [currentSrc, setCurrentSrc] = useState(getTimestampedUrl(url));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // ฟังก์ชันโหลดรูปใหม่
    const refreshImage = () => {
        setLoading(true);
        setCurrentSrc(getTimestampedUrl(url));
        setLastUpdate(new Date());
    };

    // ตั้งเวลาให้ Refresh อัตโนมัติ (ผมตั้งไว้ทุก 60 วินาที เพื่อดักรอภาพใหม่ 5 นาที)
    useEffect(() => {
        const interval = setInterval(refreshImage, 60 * 1000); // 60000ms = 1 นาที
        return () => clearInterval(interval);
    }, [url]);

    // เมื่อโหลดรูปเสร็จ
    const handleLoad = () => {
        setLoading(false);
        setError(false);
    };

    // เมื่อโหลดรูปไม่ผ่าน
    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-inner group">

            {/* 1. ส่วนแสดงรูปภาพ */}
            {url && !error ? (
                <img
                    src={currentSrc}
                    alt="CCTV Snapshot"
                    className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            ) : (
                // กรณีไม่มี URL หรือโหลดไม่ได้
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ImageOff size={48} className="mb-2 opacity-30" />
                    <span className="text-xs font-mono tracking-widest opacity-60">NO SNAPSHOT</span>
                </div>
            )}

            {/* 2. Loading Overlay (หมุนๆ ตอนกำลังโหลดรูปใหม่) */}
            {loading && url && !error && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <RefreshCw size={32} className="text-blue-500 animate-spin opacity-80" />
                </div>
            )}

            {/* 3. Overlay ข้อมูลมุมบนซ้าย */}
            <div className="absolute top-2 left-2 flex items-center gap-2 z-20">
                <div className="bg-black/60 px-2 py-1 rounded text-[10px] text-white backdrop-blur-sm flex items-center gap-2 border border-white/10">
                    <Camera size={12} className="text-green-400" />
                    <span className="font-semibold tracking-wide">{label || 'SNAPSHOT CAM'}</span>
                </div>
            </div>

            {/* 4. Overlay ปุ่ม Refresh และเวลา มุมขวาล่าง */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                {/* เวลาอัปเดตล่าสุด */}
                <span className="text-[10px] text-gray-300 bg-black/50 px-2 py-1 rounded backdrop-blur-sm font-mono">
                    Updated: {lastUpdate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* ปุ่มกด Refresh เอง */}
                <button
                    onClick={refreshImage}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-lg transition-colors"
                    title="Refresh Snapshot"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

        </div>
    );
};

export default CCTVPlayer;