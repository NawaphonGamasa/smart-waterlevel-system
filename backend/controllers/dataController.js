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