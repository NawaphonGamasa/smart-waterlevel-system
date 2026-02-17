const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const controlController = require('../controllers/controlController');
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);

// GET ข้อมูลทั้งหมด
router.get('/dashboard', verifyToken, dataController.getDashboardData);
router.get('/report', verifyToken, dataController.getDailyReport);

// POST สั่งงาน (ควรมีการป้องกันเพิ่มในอนาคต)
router.post('/control/gate', verifyToken, isAdmin, controlController.toggleGate);
router.post('/control/settings', verifyToken, isAdmin, controlController.updateSettings);

module.exports = router;