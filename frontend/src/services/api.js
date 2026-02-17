import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // ถ้าเกิน 10 วิให้ตัด Connection (กันหน้าเว็บค้าง)
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const loginUser = async (username, password) => {
    try {
        const response = await api.post('/login', { username, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
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