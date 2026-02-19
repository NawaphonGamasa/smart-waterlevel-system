import React, { useState, useEffect } from 'react';
import MapContainer from './MapContainer';
import StatusPanel from './StatusPanel';
import Loading from '../Common/Loading';
import useRealtime from '../../hooks/useRealtime';
import PermissionAlert from '../Common/PermissionAlert';
import { saveSettings } from '../../services/api';

// พิกัดหมุดบนแผนที่ (ปรับตามความจริง)
const STATION_POSITIONS = {
  ROAD: [586.93, 454.88],
  CANAL: [626.46, 351.88]
};

const Dashboard = () => {
  // เรียกใช้ Hook
  const { waterData, historyData, isConnected, isLoading, settings, fetchData } = useRealtime();
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [snooze, setSnooze] = useState(false); // ตัวแปรกัน popup เด้งรัวๆ

  useEffect(() => {
    // รอให้ข้อมูลมาครบก่อนค่อยเช็ค
    if (!waterData || !settings) return;

    const userRole = localStorage.getItem('role');
    const isStaff = userRole === 'admin' || userRole === 'admin2';
    const currentLevel = Number(waterData.road_val);
    const canalLevel = Number(waterData.canal_val);
    const limitLevel = Number(settings.start_val) / 10;
    const diffLimit = Number(settings.diff_val) / 10;

    // 2. คำนวณผลต่างจริง (น้ำถนน - น้ำคลอง)
    const currentDiff = currentLevel - canalLevel;

    console.log("🌊 MONITORING (Scaled):", {
      Level: currentLevel,
      Canal: canalLevel,
      Actual_Diff: currentDiff.toFixed(2),
      Limit_Raw: settings.start_val,
      Limit_Real: limitLevel,
      IsCritical: currentLevel >= limitLevel,
      Setting_Diff: diffLimit,
      IsDiffEnough: currentDiff >= diffLimit
    });

    // เงื่อนไข: น้ำถนน > ค่า Start และ Permission ยังเป็น 0 (False)
    const isCritical = currentLevel >= limitLevel;
    const isNotAllowed = settings.permission_val != 1;
    // ความต่างของน้ำทั่งสองฝั่งจะต้องมากกว่าค่าความต่างที่เราตั้งไว้
    const isDiffPass = currentDiff >= diffLimit;
    // ค่าฝั่งคลองจะต้องไม่ต่ำกว่า 0
    const isCanalValid = canalLevel >= 0;

    // ถ้าเข้าเงื่อนไข และไม่ได้กด Snooze -> แสดง Popup
    if (isCritical && isNotAllowed && !snooze && isDiffPass && isCanalValid && isStaff) {
      setShowPermissionPopup(true);
    } else {
      setShowPermissionPopup(false);
    }
  }, [waterData, settings, snooze]);

  // ฟังก์ชัน: เมื่อกด "อนุญาต"
  const handleAllow = async () => {
    try {
      // 1. ส่งคำสั่งเปิด Permission (ON)
      await saveSettings({
        ...settings,
        permission_val: 1
      });

      setShowPermissionPopup(false);
      fetchData(); // รีเฟรชหน้าจอ

      // ดึงค่าเวลาเปิดประตู ถ้าไม่มีค่า ให้กันเหนียวไว้ที่ 60 วินาที
      const durationSeconds = Number(settings.open_time_val) || 60;

      console.log(`⏳ Permission granted for ${durationSeconds} seconds...`);

      // ตั้งเวลา (setTimeout) ตามจำนวนวินาที * 1000 (แปลงเป็น ms)
      setTimeout(async () => {
        try {
          console.log("⏰ Time's up! Revoking permission...");

          // ส่งคำสั่งปิด Permission (OFF)
          await saveSettings({
            ...settings,
            permission_val: 0
          });

          fetchData(); // รีเฟรชหน้าจออีกครั้ง

        } catch (err) {
          console.error("❌ Failed to auto-revoke permission:", err);
        }
      }, durationSeconds * 1000);

    } catch (err) {
      console.error("Error allowing permission:", err);
      alert("เกิดข้อผิดพลาดในการส่งคำสั่ง");
    }
  };

  // ฟังก์ชัน: เมื่อกด "ไม่อนุญาต" (Snooze)
  const handleDeny = async () => {
    // 1. ปิด Popup และเปิดโหมด Snooze บนหน้าเว็บทันที
    setShowPermissionPopup(false);
    setSnooze(true);

    // เพิ่มการส่งคำสั่ง 0 ย้ำไปที่ Backend/PLC เพื่อความปลอดภัย
    try {
      await saveSettings({
        ...settings,
        permission_val: 0
      });
      fetchData(); // รีเฟรชข้อมูลล่าสุด
    } catch (err) {
      console.error("❌ Error enforcing deny permission:", err);
    }

    // 3. ตั้งเวลา Snooze (ปิดไว้ชั่วคราว)
    // ถ้าอยากได้ 5 นาทีต้องเปลี่ยนเป็น 300000 (5 * 60 * 1000)
    setTimeout(() => setSnooze(false), 5000);
  };

  // ถ้ากำลังโหลดข้อมูล ให้แสดงหน้า Loading
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
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">
      {showPermissionPopup && (
        <PermissionAlert
          level={waterData.road_val}
          onAllow={handleAllow}
          onDeny={handleDeny}
        />
      )}
      {/* ส่วนที่ 1: พื้นที่แผนที่ */}
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
      <div className="h-[50%] w-full lg:h-full lg:w-[25%] flex-shrink-0 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 shadow-2xl z-10 flex flex-col">
        <StatusPanel
          waterData={waterData}
          historyData={historyData}
          settings={settings}
          onRefresh={fetchData}
        />
      </div>

    </div>
  );
};

export default Dashboard;