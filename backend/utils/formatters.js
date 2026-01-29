/**
 * แปลงวันที่เป็น Format ไทย (เช่น 27/01/2026 14:30:00)
 * @param {Date|string} dateData 
 * @returns {string} Formatted Date String
 */
const formatThaiDate = (dateData) => {
    if (!dateData) return '-';
    const date = new Date(dateData);
    
    // ใช้ toLocaleString เพื่อแปลงเป็นเวลาไทย
    return date.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // ใช้ระบบ 24 ชั่วโมง
    });
};

/**
 * แปลงค่าระดับน้ำเป็นทศนิยม 2 ตำแหน่งเสมอ
 * @param {number} value 
 * @returns {string}
 */
const formatLevel = (value) => {
    return parseFloat(value).toFixed(2);
};

module.exports = { formatThaiDate, formatLevel };