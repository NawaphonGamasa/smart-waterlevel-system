import React from 'react';
import MapContainer from './MapContainer';
import StatusPanel from './StatusPanel';
import Loading from '../Common/Loading';
import useRealtime from '../../hooks/useRealtime';

// พิกัดหมุดบนแผนที่ (ปรับตามความจริง)
const STATION_POSITIONS = {
  ROAD: [450, 600],
  CANAL: [450, 900]
};

const Dashboard = () => {
  // เรียกใช้ Hook
  const { waterData, historyData, isConnected, isLoading } = useRealtime();

  // ถ้ากำลังโหลดข้อมูล ให้แสดงหน้า Loading สวยๆ
  if (isLoading) return <Loading />;

  const stations = [
    {
      id: 1,
      name: 'Station 1: Road Side',
      status: waterData.road_val <= 0 ? 'fault' : 'normal', 
      val: waterData.road_val,
      position: STATION_POSITIONS.ROAD,
      lastUpdate: waterData.log_time,
      camUrl: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f' // ใส่ URL กล้อง
    },
    {
      id: 2,
      name: 'Station 2: Canal Side',
      status: waterData.canal_val <= 0 ? 'fault' : 'normal',
      val: waterData.canal_val,
      position: STATION_POSITIONS.CANAL,
      lastUpdate: waterData.log_time,
      camUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0'
    }
  ];

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">
      
      {/* ส่วนที่ 1: พื้นที่แผนที่ (ซ้าย) */}
      <div className="flex-1 relative z-0">
        <MapContainer stations={stations} />
        
        {/* Connection Status Label */}
        <div className="absolute top-4 left-11 z-[400] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold flex items-center gap-3 border border-white/10 shadow-lg select-none">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' : 'bg-red-500'}`}></div>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
            </span>
        </div>
      </div>

      {/* ส่วนที่ 2: แถบสถานะ (ขวา) */}
      <div className="w-[25%] flex-shrink-0 bg-gray-800 border-l border-gray-700 shadow-2xl z-10 flex flex-col">
        <StatusPanel 
            waterData={waterData} 
            historyData={historyData}
        />
      </div>

    </div>
  );
};

export default Dashboard;