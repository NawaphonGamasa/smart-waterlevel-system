import { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import { getDashboardData } from '../services/api';

const useRealtime = () => {
  const [waterData, setWaterData] = useState({
    road_val: 0,
    canal_val: 0,
    q1_status: 0,
    q2_status: 0,
    log_time: null
  });
  
  const [historyData, setHistoryData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. State สำหรับเก็บค่า Setting
  const [settings, setSettings] = useState(null);

  // 2. ย้ายฟังก์ชันดึงข้อมูลออกมาข้างนอก useEffect และเปลี่ยนชื่อเป็น fetchData
  // เพื่อให้ Component อื่น (เช่น ปุ่มบันทึก) สามารถเรียกใช้เพื่อ Refresh ข้อมูลได้
  const fetchData = async () => {
      try {
        const res = await getDashboardData();
        if (res.data) {
            if (res.data.current) setWaterData(prev => ({ ...prev, ...res.data.current }));
            if (res.data.history) setHistoryData(res.data.history);
            
            // ✅ เพิ่มบรรทัดนี้: บันทึกค่า Settings ที่ได้จาก Database
            if (res.data.settings) setSettings(res.data.settings); 
        }
      } catch (err) {
        console.error("❌ Fetch Data Failed:", err);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    // เรียกใช้ฟังก์ชันดึงข้อมูลครั้งแรก
    fetchData();

    // เชื่อมต่อ Socket และรอฟังสถานะจริง
    socketService.connect();

    // ฟังก์ชันเปลี่ยนสถานะเมื่อต่อติด หรือหลุด
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // ลงทะเบียนรอฟัง Event มาตรฐานของ Socket ('connect' และ 'disconnect')
    socketService.subscribe('connect', onConnect);
    socketService.subscribe('disconnect', onDisconnect);

    // รอรับข้อมูล Real-time
    const handleUpdate = (newData) => {
      setWaterData(prev => ({ ...prev, ...newData }));
      
      setHistoryData(prev => {
        const newEntry = { ...newData, log_time: new Date().toISOString() };
        // เก็บกราฟย้อนหลังแค่ 20 จุดล่าสุด
        const newHistory = [...prev, newEntry];
        if (newHistory.length > 20) newHistory.shift();
        return newHistory;
      });
    };

    socketService.subscribe('water-update', handleUpdate);

    // Cleanup: ตัดการเชื่อมต่อและเอา Listener ออกเมื่อเปลี่ยนหน้า
    return () => {
      socketService.unsubscribe('water-update');
      socketService.unsubscribe('connect');    
      socketService.unsubscribe('disconnect'); 
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  // 3. ✅ ส่ง settings และ fetchData ออกไปให้คนอื่นใช้
  return { waterData, historyData, isConnected, isLoading, settings, fetchData };
};

export default useRealtime;