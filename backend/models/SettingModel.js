const db = require('../config/db');

const SettingModel = {
    // ดึงค่า Setting ปัจจุบัน
    async getSettings() {
        const sql = 'SELECT * FROM system_settings WHERE id = 1';
        const [rows] = await db.execute(sql);
        return rows[0];
    },

    // อัปเดตค่า Setting (เพิ่ม open_time และ close_time)
    async updateSettings(data) {
        const sql = `
            UPDATE system_settings
            SET start_val = ?, 
                stop_val = ?, 
                diff_val = ?, 
                open_time_val = ?, 
                close_time_val = ?, 
                permission_val = ?,
                last_update = NOW()
            WHERE id = 1
        `;
        const [result] = await db.execute(sql, [
            data.start_val,
            data.stop_val,
            data.diff_val,
            data.open_time_val,  
            data.close_time_val,
            data.permission_val 
        ]);
        return result.affectedRows > 0;
    }
};

module.exports = SettingModel;