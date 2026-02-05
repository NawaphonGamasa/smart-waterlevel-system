const LogModel = require('../models/LogModel');
const SettingModel = require('../models/SettingModel');

exports.getDashboardData = async (req, res) => {
    try {
        // ทำงานพร้อมกัน 2 อย่างเพื่อให้เร็วขึ้น
        const [latest, history, settings] = await Promise.all([
            LogModel.getLatest(),
            LogModel.getHistory(20),
            SettingModel.getSettings()
        ]);

        res.json({
            status: 'success',
            data: {
                current: latest,
                history: history,
                settings: settings
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database Error' });
    }
    
};
// --- (เพิ่มส่วนนี้) ฟังก์ชันสำหรับ Report ---
exports.getDailyReport = async (req, res) => {
    try {
        // 1. รับค่า start และ end จาก Frontend
        const { start, end } = req.query; 
        
        if (!start || !end) {
            return res.status(400).json({ status: 'error', message: 'กรุณาระบุวันเริ่มต้นและสิ้นสุด' });
        }

        // 2. เรียกใช้ฟังก์ชันใหม่ใน LogModel
        const logs = await LogModel.getByDateRange(start, end);

        // --- [ส่วนที่ต้องเพิ่ม] คำนวณค่าเฉลี่ย ---
        let totalRoad = 0;
        let totalCanal = 0;
        
        // วนลูปบวกค่าทั้งหมด
        logs.forEach(item => {
            // ใช้ parseFloat เพื่อป้องกันกรณีค่ามาเป็น String
            totalRoad += parseFloat(item.road_val || 0);
            totalCanal += parseFloat(item.canal_val || 0);
        });

        const count = logs.length;
        
        // หารจำนวนเพื่อหาค่าเฉลี่ย (ถ้าไม่มีข้อมูลให้เป็น 0)
        const avgRoad = count > 0 ? (totalRoad / count).toFixed(1) : 0;
        const avgCanal = count > 0 ? (totalCanal / count).toFixed(1) : 0;
       

        res.json({
            status: 'success',
            data: logs,
            summary: {
                avg_road: avgRoad,
                avg_canal: avgCanal,
                total_records: count,
                period: { start: start, end: end }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Database Error' });
    }
};