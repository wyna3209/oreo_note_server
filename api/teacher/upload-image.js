const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../../drive/drive'); // Google Drive에 이미지 업로드 함수
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');

const upload = multer({ storage: multer.memoryStorage() }); // 메모리 스토리지에 파일 저장

// Google Drive의 Template 폴더 안에 이미지를 저장하는 엔드포인트
router.post('/:fileName', upload.single('file'), async (req, res) => {
  let {fileName} = req.params;
  console.log(fileName);
  const fileBuffer = req.file.buffer; // 업로드된 파일의 버퍼
  const templateFolderId ='1V9Jkv7LvJZBxouazVPAUgBnyqJqYsN-K';

  try {
     // 파일 이름을 명확하게 문자열로 변환
     if (typeof fileName !== 'string') {
       fileName = String(fileName);
     }
  
// 확장자가 '.pdf'라면 제거
      if (fileName.endsWith('.pdf')) {
        fileName = fileName.slice(0, -4); // 문자열에서 마지막 4글자('.pdf')를 제거
      }

     if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg') && !fileName.endsWith('.png')) {
       fileName += '.jpg'; // 기본적으로 .jpg 확장자를 추가
     }

    // Buffer를 파일로 저장
    const tempFilePath = await saveBufferToFile(fileBuffer, `${fileName}.jpg`);

    // Google Drive에 이미지 업로드
    const result = await uploadImage(fileName, tempFilePath, templateFolderId);

    // 임시 파일 삭제
    fs.unlinkSync(tempFilePath);

    res.status(200).json({ message: `Image ${result.name} uploaded successfully with ID ${result.id}.` });
  } catch (err) {
    console.error('Error uploading image to Google Drive:', err);
    res.status(500).json({ message: 'Error uploading image.' });
  }
});

// Buffer를 임시 파일로 저장하는 함수
const saveBufferToFile = async (buffer, fileName) => {
  const tempDir = os.tmpdir(); // OS의 임시 디렉토리 경로
  const filePath = path.join(tempDir, fileName);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(filePath);
    });
  });
};

module.exports = router;
