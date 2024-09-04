const express = require('express');
const router = express.Router();
const { listFiles } = require('../../drive/drive');

// 학생 이름으로 학습지 목록 조회
router.get('/:studentName', async (req, res) => {
  const studentName = req.params.studentName;

  try {
    const files = await listFiles();  // Google Drive에서 모든 파일 목록 가져오기
    const studentFiles = files.filter(file => file.name.includes(studentName));
    res.json(studentFiles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching worksheets for student' });
  }
});

module.exports = router;
