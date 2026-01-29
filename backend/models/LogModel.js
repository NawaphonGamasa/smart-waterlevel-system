const db = require('../config/db');

const LogModel = {
    // ดึงข้อมูลล่าสุด 1 แถว (เพื่อโชว์สถานะปัจจุบัน)
    async getLatest() {
        const sql = 'SELECT * FROM log_levels ORDER BY id DESC LIMIT 1';
        const [rows] = await db.execute(sql);
        return rows[0];
    },

    // ดึงข้อมูลกราฟย้อนหลัง 20 รายการล่าสุด
    async getHistory(limit = 20) {
        const sql = 'SELECT * FROM log_levels ORDER BY id DESC LIMIT ?';
        const [rows] = await db.execute(sql, [limit.toString()]); // แปลง limit เป็น string เพื่อกัน bug
        return rows.reverse(); // กลับด้าน array ให้กราฟวิ่งจากซ้ายไปขวา
    },

    // บันทึกข้อมูลใหม่ (เรียกใช้เมื่อได้รับค่าจาก MQTT)
    async create(data) {
        const sql = `
            INSERT INTO log_levels (road_val, canal_val, q1_status, q2_status, log_time)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(sql, [
            data.road_val,
            data.canal_val,
            data.q1_status,
            data.q2_status
        ]);
        return result.insertId;
    }
};

module.exports = LogModel;