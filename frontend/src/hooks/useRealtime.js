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

  useEffect(() => {
    // 1. ดึงข้อมูลครั้งแรกจาก API (Initial Fetch)
    const initData = async () => {
      try {
        const res = await getDashboardData();
        if (res.data) {
            if (res.data.current) setWaterData(prev => ({ ...prev, ...res.data.current }));
            if (res.data.history) setHistoryData(res.data.history);
        }
      } catch (err) {
        console.error("❌ Init Data Failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();

    // 2. เชื่อมต่อ Socket และรอฟังสถานะจริง
    socketService.connect();

    // ฟังก์ชันเปลี่ยนสถานะเมื่อต่อติด หรือหลุด
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // ลงทะเบียนรอฟัง Event มาตรฐานของ Socket ('connect' และ 'disconnect')
    socketService.subscribe('connect', onConnect);
    socketService.subscribe('disconnect', onDisconnect);

    // 3. รอรับข้อมูล Real-time
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
      socketService.unsubscribe('connect');    // ยกเลิกการฟัง connect
      socketService.unsubscribe('disconnect'); // ยกเลิกการฟัง disconnect
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  return { waterData, historyData, isConnected, isLoading };
};

export default useRealtime;