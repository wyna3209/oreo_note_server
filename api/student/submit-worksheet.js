const express = require('express');
const multer = require('multer');
const { getFolderIdByName, uploadImage, createFolder } = require('../../drive/drive');
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// 부모 폴더 ID: 날짜 폴더를 생성할 위치 (예: 선생님이 볼 수 있는 폴더의 부모 폴더)
const parentFolderIdForDate = '1fZbnOBbaklX7o_uCvSgVCfA_7hgElESr'; 

// 학생 학습지 제출
router.post('/:userName/:fileName', upload.single('file'), async (req, res) => {
  const { userName, fileName } = req.params;
  const filePath = req.file.path;
  const parentFolderId = '1Z0-J2U0vg9oQRcWLnFgKRgwEyJnfIA16'; // Students 폴더
  const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 (YYYY-MM-DD 형식)

  try {
    // 1. 학생 폴더 ID 찾기
    const studentFolderId = await getFolderIdByName(userName, parentFolderId);
    if (!studentFolderId) {
      return res.status(404).json({ message: '학생 폴더를 찾을 수 없습니다.' });
    }

    // 2. 오늘 날짜 폴더 ID 찾기 (또는 없으면 생성)
    let dateFolderId = await getFolderIdByName(today, parentFolderIdForDate);
    if (!dateFolderId) {
      // 날짜 폴더가 없다면 생성
      dateFolderId = await createFolder(today, parentFolderIdForDate);
    }

    // 3. 학생 폴더에 학습지 저장
    await uploadImage(fileName, filePath, studentFolderId);

    // 4. 날짜 폴더에 학습지 저장
    await uploadImage(fileName, filePath, dateFolderId);

    // 5. 임시 파일 삭제
    fs.unlinkSync(filePath);

    res.status(200).json({ message: '학습지가 성공적으로 제출되었습니다.' });
  } catch (err) {
    console.error('학습지 제출 중 오류 발생:', err);
    res.status(500).json({ message: '학습지 제출 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
