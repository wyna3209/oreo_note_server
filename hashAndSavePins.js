const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 학생1 ~ 학생24의 핀번호 202401 ~ 202424
const students = {};
for (let i = 1; i <= 24; i++) {
  const studentName = `학생${i}`;
  const pin = `2024${String(i).padStart(2, '0')}`; // 예: 202401, 202402 ...
  const hashedPin = bcrypt.hashSync(pin, saltRounds);
  students[studentName] = hashedPin;
}

// 해싱된 핀번호를 파일로 저장
fs.writeFileSync('hashedPins.json', JSON.stringify(students, null, 2), 'utf-8');
console.log('해싱된 핀번호가 파일에 저장되었습니다.');
