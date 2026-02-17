const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// 1. Config
dotenv.config();
require('./config/db'); // Test DB Connection

// 2. Import Services & Routes
const { initMqtt } = require('./services/mqttService');
const apiRoutes = require('./routes/apiRoutes');
const apiLimiter = require('./middlewares/rateLimit');

const app = express();
const server = http.createServer(app);

// 3. Security Middleware
app.use(helmet());
// แก้ CORS
const corsOptions = {
    origin: function (origin, callback) {
        // อนุญาตให้ผ่านหมด
        // null คือกรณีเรียกจาก Server-to-Server หรือ Postman
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true // อนุญาตให้ส่ง Cookie/Header ข้าม Domain ได้
};

app.use(cors(corsOptions));
app.use(express.json());

// 4. Rate Limiting (ความปลอดภัย: กันยิงรัว)
app.use('/api/', apiLimiter);

// 5. Socket.io Setup
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);
});

// 6. Start MQTT (ส่ง io เข้าไปเพื่อให้ MQTT ส่งค่าไป Frontend ได้)
initMqtt(io);

// 7. Routes
app.use('/api', apiRoutes);

// Test Route
app.get('/', (req, res) => res.send('🚀 Smart Water Level System API is Ready!'));

// 8. Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready`);
});