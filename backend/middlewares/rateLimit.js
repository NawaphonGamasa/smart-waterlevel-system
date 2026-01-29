const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 นาที
    max: 100, // อนุญาตให้ยิงได้ 100 ครั้งต่อนาที
    message: { status: 'error', message: 'Too many requests, please try again later.' }
});

module.exports = apiLimiter;