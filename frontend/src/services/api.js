import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // ถ้าเกิน 10 วิให้ตัด Connection (กันหน้าเว็บค้าง)
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. ดึงข้อมูล Dashboard ทั้งหมด (ค่าปัจจุบัน + กราฟ + Setting)
export const getDashboardData = async () => {
    try {
        const response = await api.get('/dashboard');
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// 2. สั่งเปิด/ปิดประตู (Command: 'OPEN', 'CLOSE', 'AUTO')
export const sendGateCommand = async (command) => {
    return await api.post('/control/gate', { command });
};

// 3. บันทึกค่า Setting (Start, Stop, Time, etc.)
export const saveSettings = async (settings) => {
    return await api.post('/control/settings', settings);
};
// 4. ดึงรายงานสรุประดับน้ำรายวัน (เพิ่มส่วนนี้)
export const getDailyReport = async (startDate, endDate) => {
    try {
        // ส่ง query param: ?start=2023-10-01&end=2023-10-03
        const response = await api.get(`/report?start=${startDate}&end=${endDate}`);
        return response.data;
    } catch (error) {
        console.error('API Report Error:', error);
        throw error;
    }
};
export default api;