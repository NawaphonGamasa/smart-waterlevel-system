const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const controlController = require('../controllers/controlController');

// GET ข้อมูลทั้งหมด
router.get('/dashboard', dataController.getDashboardData);
router.get('/report', dataController.getDailyReport);

// POST สั่งงาน (ควรมีการป้องกันเพิ่มในอนาคต)
router.post('/control/gate', controlController.toggleGate);
router.post('/control/settings', controlController.updateSettings);

module.exports = router;