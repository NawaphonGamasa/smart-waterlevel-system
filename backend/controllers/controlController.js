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

// อัปเดตค่า Setting (เพิ่ม Time)
exports.updateSettings = async (req, res) => {
    // รับค่าทั้งหมดจากหน้าเว็บ
    const { start_val, stop_val, diff_val, open_time_val, close_time_val } = req.body;

    try {
        // 1. อัปเดตลง Database
        await SettingModel.updateSettings({
            start_val, stop_val, diff_val, open_time_val, close_time_val
        });

        // 2. ส่ง MQTT ไป Node-RED
        // (ส่ง Key ให้ตรงกับที่เขียนใน Function 4 ของ Node-RED: start, stop, diff, open_time, close_time)
        mqttService.sendCommand('water/control/settings', {
            start: start_val,
            stop: stop_val,
            diff: diff_val,
            open_time: open_time_val,
            close_time: close_time_val
        });

        res.json({ status: 'success', message: 'Settings updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    }
};