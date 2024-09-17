const express = require('express');
const bcrypt = require('bcryptjs');  // bcrypt 대신 bcryptjs 사용
const fs = require('fs');
const router = express.Router();

// 서버 시작 시 해싱된 핀번호 파일을 읽어오기
let students = {};
const loadHashedPins = () => {
  try {
    const data = fs.readFileSync('hashedPins.json', 'utf-8');
    students = JSON.parse(data);
    console.log('해싱된 핀번호가 로드되었습니다.');
  } catch (error) {
    console.error('해싱된 핀번호를 로드하는 중 오류 발생:', error);
  }
};

// 해싱된 핀번호 로드
loadHashedPins();

// 핀번호 검증 API
router.post('/verify-pin', async (req, res) => {
  const { user_name, pin } = req.body;

  // 해당 학생의 해싱된 핀번호 가져오기
  const hashedPin = students[user_name];
  
  if (!hashedPin) {
    return res.status(400).json({ status: 'failure', message: '사용자를 찾을 수 없습니다.' });
  }

  // 핀번호를 해싱하여 저장된 해시값과 비교
  const isMatch = await bcrypt.compare(pin, hashedPin);

  if (isMatch) {
    return res.json({ status: 'success', message: '인증 성공' });
  } else {
    return res.status(400).json({ status: 'failure', message: '잘못된 PIN 번호입니다.' });
  }
});

module.exports = router;
