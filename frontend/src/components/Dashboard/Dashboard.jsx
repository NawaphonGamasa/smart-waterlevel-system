import React from 'react';
import MapContainer from './MapContainer';
import StatusPanel from './StatusPanel';
import Loading from '../Common/Loading';
import useRealtime from '../../hooks/useRealtime';

// พิกัดหมุดบนแผนที่ (ปรับตามความจริง)
const STATION_POSITIONS = {
  ROAD: [586.93, 454.88],
  CANAL: [626.46, 351.88]
};

const Dashboard = () => {
  // เรียกใช้ Hook
  const { waterData, historyData, isConnected, isLoading, settings, fetchData } = useRealtime();

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
      camUrl: '' // ใส่ URL กล้อง URL นี้มาจาก nodered
    },
    {
      id: 2,
      name: 'Station 2: Canal Side',
      status: waterData.canal_val <= 0 ? 'fault' : 'normal',
      val: waterData.canal_val,
      position: STATION_POSITIONS.CANAL,
      lastUpdate: waterData.log_time,
      camUrl: 'http://localhost:1880/cam2'
    }
  ];

  return (
    // ✅ 1. Container หลัก: เปลี่ยนเป็น flex-col (แนวตั้ง) สำหรับมือถือ และ lg:flex-row (แนวนอน) สำหรับจอคอม
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">

      {/* ส่วนที่ 1: พื้นที่แผนที่ */}
      {/* ✅ 2. ปรับขนาด: มือถือสูง 50% กว้างเต็ม / จอคอมสูงเต็ม ยืดความกว้าง (flex-1) */}
      <div className="h-[50%] w-full lg:h-full lg:flex-1 relative z-0">
        <MapContainer stations={stations} />

        {/* Connection Status Label */}
        <div className="absolute top-4 left-4 lg:left-11 z-[400] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold flex items-center gap-3 border border-white/10 shadow-lg select-none">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' : 'bg-red-500'}`}></div>
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* ส่วนที่ 2: แถบสถานะ */}
      {/* ✅ 3. ปรับขนาด: มือถือสูง 50% กว้างเต็ม / จอคอมสูงเต็ม กว้าง 25% */}
      {/* ✅ 4. ปรับเส้นขอบ: มือถือมีขอบบน (border-t) / จอคอมมีขอบซ้าย (border-l) */}
      <div className="h-[50%] w-full lg:h-full lg:w-[25%] flex-shrink-0 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 shadow-2xl z-10 flex flex-col">
        <StatusPanel
          waterData={waterData}
          historyData={historyData}
          settings={settings}           // <-- เพิ่มบรรทัดนี้
          onRefresh={fetchData}         // <-- เพิ่มบรรทัดนี้ (เพื่อให้กดบันทึกแล้วหน้าเว็บอัปเดต)
        />
      </div>

    </div>
  );
};

export default Dashboard;