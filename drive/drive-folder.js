const express = require('express');
const router = express.Router();
const { listFiles } = require('./drive');

// 폴더이름으로 폴더의 내용 가져오기
router.get('/name/:userName', async (req, res) => {
  console.log("drive-folder-by-name");
  const userName = req.params.userName;
  const folderId ='1Z0-J2U0vg9oQRcWLnFgKRgwEyJnfIA16'; //Stduents폴더의 id
  try {
    const files = await listFiles(folderId,userName);  // 상위폴더(Stduent)Id와 학생이름으로 폴더 및 파일 검색
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files from Google Drive' });
  }
});



// 폴더Id로 폴더의 내용 가져오기
router.get('/id/:folderId', async (req, res) => {
  console.log("drive-folder");
  const folderId = req.params.folderId;
  try {
    const files = await listFiles(folderId);  //  폴더의 ID를 사용
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files from Google Drive' });
  }
});



module.exports = router;
