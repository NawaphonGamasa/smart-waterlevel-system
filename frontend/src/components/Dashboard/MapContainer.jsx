import React, { useState, useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import StationPopup from './StationPopup';

// --- ตั้งค่าแผนที่ (Image Overlay) ---
// สมมติรูปโรงงานของคุณชื่อ factory-offline.jpg อยู่ใน public/maps/
// พิกัดขอบเขตของรูป (Bounds) [[Y1, X1], [Y2, X2]] 
// แนะนำให้ใช้ 1000x1000 ไปก่อน แล้วค่อยขยับหมุดให้ตรงจุด
const bounds = [[1284, 0], [0, 2048]];

// --- ฟังก์ชันสร้างไอคอนวงกลมกระพริบ ---
const createPulsingIcon = (status) => {
    return L.divIcon({
        className: 'custom-icon', // คลาสหลอกๆ ของ Leaflet (ไม่ต้องสนใจ)
        html: `<div class="marker-pin ${status === 'fault' ? 'marker-red' : 'marker-green'}"></div>`,
        iconSize: [24, 24], // ขนาด
        iconAnchor: [12, 12], // จุดกึ่งกลาง (ครึ่งหนึ่งของขนาด)
        popupAnchor: [0, -10] // จุดที่ Popup จะเด้งขึ้นมา
    });
};

const MapComponent = ({ stations }) => {
    return (
        <MapContainer
            crs={L.CRS.Simple} // ใช้พิกัดแบบรูปภาพ
            bounds={bounds}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            // ✅ ปรับ Responsive Class:
            // - Mobile: เต็มจอ (rounded-none), ไม่มีเงา, พื้นหลังมืด
            // - Desktop (lg): มุมโค้ง (rounded-2xl), มีเงา (shadow-2xl), มีขอบ (border)
            className="w-full h-full bg-[#0B1121] z-0 rounded-none lg:rounded-2xl shadow-none lg:shadow-2xl lg:border lg:border-gray-800 outline-none"
            minZoom={0}
            maxZoom={2} 
            zoomSnap={0.1} // แก้ไขคำผิดจาก zommsnap -> zoomSnap
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }} // บังคับให้เต็มกรอบ
        >
            {/* 1. รูปพื้นหลังแผนที่ */}
            <ImageOverlay
                url="/maps/factory-map.jpg" 
                bounds={bounds}
            />

            {/* 2. วนลูปสร้างหมุด (Markers) */}
            {stations.map((station) => (
                <Marker
                    key={station.id}
                    position={station.position} // [y, x]
                    icon={createPulsingIcon(station.status)} // เลือกสีหมุดตามสถานะ
                >
                    <Popup className="custom-popup">
                        {/* เรียกใช้ Component รายละเอียดข้างใน Popup */}
                        <StationPopup data={station} />
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;