const winston = require('winston');
const path = require('path');

// กำหนดรูปแบบการแสดงผลของ Log
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'info', // ระดับต่ำสุดที่จะบันทึก (info, warn, error)
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 1. บันทึก Error ลงไฟล์แยกต่างหาก (เอาไว้ไล่เช็คตอนระบบล่ม)
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error' 
    }),
    
    // 2. บันทึกทุกอย่างลงไฟล์รวม
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log') 
    }),
  ],
});

// ถ้าไม่ได้รันบน Production ให้โชว์ใน Console สีสวยๆ ด้วย
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }));
}

module.exports = logger;