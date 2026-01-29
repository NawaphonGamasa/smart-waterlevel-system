const mysql = require('mysql2');
const dotenv = require('dotenv');

// โหลดค่าจากไฟล์ .env
dotenv.config();

// สร้าง Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+07:00'
});

// แปลงเป็น Promise เพื่อให้ใช้ async/await
const db = pool.promise();

// ทดสอบการเชื่อมต่อเมื่อเริ่มรันไฟล์นี้
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.code);
        console.error('   -> Please check your .env file or MySQL server status.');
    } else {
        console.log('✅ Connected to Database (water_management) successfully!');
        connection.release(); // คืน Connection กลับสู่ Pool
    }
});

module.exports = db;