const bcrypt = require('bcryptjs');

const password = 'Admin21235'; 
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n=======================================');
console.log('✅ PASSWORD: ' + password);
console.log('🔒 HASH:     ' + hash); // <--- ก๊อปปี้ค่านี้
console.log('=======================================\n');