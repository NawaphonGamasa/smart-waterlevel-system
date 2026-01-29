import { io } from 'socket.io-client';

// URL ของ Backend (ระวัง! ต้องไม่มี /api ต่อท้ายสำหรับ Socket)
const SOCKET_URL = 'http://localhost:3000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    // เริ่มเชื่อมต่อ
    connect() {
        // ถ้ามี Connection อยู่แล้วไม่ต้องสร้างใหม่
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'], // บังคับใช้ WebSocket เพื่อความเร็วสูงสุด
            reconnection: true,        // ให้พยายามต่อใหม่เองถ้าเน็ตหลุด
            reconnectionAttempts: 5,   // ลองต่อใหม่ 5 ครั้ง
        });

        this.socket.on('connect', () => {
            console.log('🟢 Connected to Real-time Server ID:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.warn('🔴 Disconnected from Server');
        });
    }

    // ตัดการเชื่อมต่อ (ใช้ตอนปิดหน้าเว็บ)
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // ฟังก์ชันสำหรับให้หน้าเว็บ "รอฟัง" ข้อมูล (Subscribe)
    // eventName: ชื่อเหตุการณ์ (เช่น 'water-update')
    // callback: ฟังก์ชันที่จะทำงานเมื่อข้อมูลมาถึง
    subscribe(eventName, callback) {
        if (!this.socket) this.connect();
        this.socket.on(eventName, callback);
    }

    // ยกเลิกการฟัง (Unsubscribe)
    unsubscribe(eventName) {
        if (this.socket) {
            this.socket.off(eventName);
        }
    }
}

// สร้าง Instance เดียวใช้ทั้งแอป (Singleton)
const socketService = new SocketService();
export default socketService;