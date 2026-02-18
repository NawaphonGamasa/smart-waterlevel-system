const mqttService = require('../services/mqttService');
const SettingModel = require('../models/SettingModel');

// สั่งเปิด/ปิดประตู (AUTO/MANUAL)
exports.toggleGate = (req, res) => {
    const { command } = req.body;
    if (!['OPEN', 'CLOSE', 'AUTO'].includes(command)) {
        return res.status(400).json({ message: 'Invalid command' });
    }
    mqttService.sendCommand('water/control/command', { action: command });
    res.json({ status: 'success', message: `Sent command: ${command}` });
};

// backend/controllers/controlController.js

exports.updateSettings = async (req, res) => {
    // 1. รับค่าจากหน้าเว็บ
    const { start_val, stop_val, diff_val, open_time_val, close_time_val, permission_val } = req.body;

    // --- ส่วนที่เพิ่ม: ฟังก์ชันแปลง "นาที:วินาที" ให้เป็น "วินาที" (เช่น "2:30" -> 150) ---
    const toSeconds = (val) => {
        const str = String(val);
        if (str.includes(':')) {
            const parts = str.split(':');
            const min = parseInt(parts[0]) || 0;
            const sec = parseInt(parts[1]) || 0;
            return (min * 60) + sec;
        }
        return Number(val); // ถ้าเป็นตัวเลขอยู่แล้ว ก็ใช้เลย
    };

    // แปลงค่าเวลาก่อนใช้งาน
    const openSeconds = toSeconds(open_time_val);
    const closeSeconds = toSeconds(close_time_val);
    // -----------------------------------------------------------------------

    try {
        // 2. อัปเดตลง Database (ส่งเป็นวินาทีล้วนๆ ไปเก็บ)
        await SettingModel.updateSettings({
            start_val, 
            stop_val, 
            diff_val, 
            open_time_val: openSeconds,  // เก็บ 150
            close_time_val: closeSeconds, // เก็บ 150
            permission_val: permission_val ? 1 : 0
        });

        // 3. ส่ง MQTT ไป Node-RED (ส่งเป็นวินาทีล้วนๆ ไปเหมือนกัน)
        mqttService.sendCommand('water/control/settings', {
            start: start_val,
            stop: stop_val,
            diff: diff_val,
            open_time: openSeconds,  // ส่ง 150
            close_time: closeSeconds, // ส่ง 150
            permission: permission_val
        });

        res.json({ status: 'success', message: 'Settings updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    }
};