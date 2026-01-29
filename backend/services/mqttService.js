const mqtt = require('mqtt');
const LogModel = require('../models/LogModel');
const logger = require('../utils/logger'); // เรียกใช้ Logger ที่เราเพิ่งสร้าง

// เชื่อมต่อ MQTT Broker (ใช้ localhost ถ้า Node-RED อยู่เครื่องเดียวกัน)
const client = mqtt.connect('mqtt://localhost:1883');

const initMqtt = (io) => {
    // 1. เมื่อเชื่อมต่อสำเร็จ
    client.on('connect', () => {
        logger.info('📡 MQTT Broker Connected');
        
        // Subscribe หัวข้อที่ Node-RED จะส่งค่าระดับน้ำมา
        client.subscribe('water/telemetry', (err) => {
            if (err) {
                logger.error(`❌ Subscribe Error: ${err.message}`);
            } else {
                logger.info('✅ Subscribed to topic: water/telemetry');
            }
        });
    });

    // 2. เมื่อได้รับข้อความ
    client.on('message', async (topic, message) => {
        if (topic === 'water/telemetry') {
            try {
                // แปลงข้อมูลเป็น JSON
                const rawMsg = message.toString();
                const data = JSON.parse(rawMsg);

                // บันทึกลง Database
                await LogModel.create(data);

                // ส่งข้อมูลไป Frontend ทันทีผ่าน Socket.io
                io.emit('water-update', data);

                // บันทึก Log ว่าได้รับข้อมูลแล้ว
                logger.info(`💾 Data Processed: Road=${data.road_val}, Canal=${data.canal_val}, Gate=[${data.q1_status},${data.q2_status}]`);

            } catch (err) {
                // บันทึก Error ถ้าข้อมูลที่ส่งมาผิด Format หรือ Database มีปัญหา
                logger.error(`❌ MQTT Message Error: ${err.message} | Payload: ${message.toString()}`);
            }
        }
    });

    // 3. จัดการ Error ของการเชื่อมต่อ
    client.on('error', (err) => {
        logger.error(`❌ MQTT Connection Error: ${err.message}`);
    });
};

// ฟังก์ชันสำหรับส่งคำสั่งจากเว็บกลับไปหา Node-RED
const sendCommand = (topic, message) => {
    if (client.connected) {
        const msgString = JSON.stringify(message);
        client.publish(topic, msgString, { qos: 1 }, (err) => {
            if (err) {
                logger.error(`❌ Publish Error: ${err.message}`);
            } else {
                logger.info(`📤 Command Sent to ${topic}: ${msgString}`);
            }
        });
    } else {
        logger.warn('⚠️ Cannot send command: MQTT Client is not connected');
    }
};

module.exports = { initMqtt, sendCommand };