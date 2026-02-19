import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const PermissionAlert = ({ level, onAllow, onDeny }) => {
    return (
        <div className="fixed top-4 right-4 lg:right-[26%] z-[1] animate-bounce-in w-full max-w-lg">
            {/* กล่องดำโปร่งแสง พร้อมขอบแดงเรืองแสง */}
            <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.4)] text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6">

                {/* ส่วน Icon และ ข้อความ */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="bg-red-500/20 p-3 rounded-full animate-pulse flex-shrink-0">
                        <AlertTriangle className="text-red-500 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-red-100 leading-tight">ระดับน้ำวิกฤต !</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            น้ำสูงถึง <span className="text-red-400 font-mono font-bold text-xl">{level.toFixed(1)}%</span>
                            <br className="sm:hidden" /> ต้องการเปิดประตูระบายน้ำ
                        </p>
                    </div>
                </div>

                {/* ส่วนปุ่มกด */}
                <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-700 pt-3 sm:pt-0 sm:pl-4 justify-end">
                    <button
                        onClick={onAllow}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 flex-1 sm:flex-none"
                    >
                        <CheckCircle size={18} />
                        อนุญาต
                    </button>

                    <button
                        onClick={onDeny}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:bg-red-900/50 hover:text-red-200 active:scale-95 flex-1 sm:flex-none"
                    >
                        <XCircle size={18} />
                        ไม่อนุญาติ
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PermissionAlert;