const express = require('express');
const multer = require('multer');
const { getFolderIdByName,uploadImage } = require('../../drive/drive');
const fs = require('fs');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });


// 학생 학습지 제출
router.post('/:userName/:fileName', upload.single('file'), async (req, res) => {
  const { userName, fileName } = req.params;
  const filePath = req.file.path;
  const parentFolderId ='1Z0-J2U0vg9oQRcWLnFgKRgwEyJnfIA16' //Stduents폴더
  try {
    // 유저 이름으로 폴더 ID를 찾습니다.
    const folderId = await getFolderIdByName(userName,parentFolderId);

    if (!folderId) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // 기존 폴더에 학습지 업데이트
    await uploadImage(fileName, filePath, folderId);

    // 임시 파일 삭제
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'Worksheet submitted successfully.' });
  } catch (err) {
    console.error('Error submitting worksheet:', err);
    res.status(500).json({ message: 'Error submitting worksheet' });
  }
});


module.exports = router;
