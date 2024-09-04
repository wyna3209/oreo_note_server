const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

// GoogleAuth를 사용하여 인증 설정
const auth = new GoogleAuth({
  keyFile: './credentials.json', // 서비스 계정 키 파일의 경로
  scopes: SCOPES,
});

// Google Drive API 클라이언트 생성
const drive = google.drive({ version: 'v3', auth: auth});

// 학생별 폴더 ID를 가져오는 함수
const getStudentFolderIds = async () => {
  try {
    // 'Students' 폴더 ID 가져오기
    const studentsFolderRes = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and name='Students' and trashed=false",
      fields: 'files(id)',
    });

    if (!studentsFolderRes.data.files || studentsFolderRes.data.files.length === 0) {
      throw new Error('Students folder not found.');
    }

    const studentsFolderId = studentsFolderRes.data.files[0].id;

    // 학생 폴더 ID와 이름 가져오기
    const studentFoldersRes = await drive.files.list({
      q: `'${studentsFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    return studentFoldersRes.data.files.map(file => ({ id: file.id, name: file.name }));
  } catch (error) {
    console.error('Error getting student folder IDs:', error.message);
    throw error;
  }
};

// 파일을 학생 폴더에 복사하는 함수
const copyFileToStudentFolders = async (fileId, studentFolders, worksheetName) => {
  for (const folder of studentFolders) {
    try {
      await drive.files.copy({
        fileId: fileId,
        requestBody: {
          name: `${worksheetName} for ${folder.name}`,
          parents: [folder.id],
        },
      });
      console.log(`Copied file to ${folder.name}`);
    } catch (error) {
      console.error(`Failed to copy file to ${folder.name}:`, error.message);
    }
  }
};

// /apply-worksheet 경로에 대한 POST 요청 처리
router.post('/', async (req, res) => {
  console.log("apply-worksheet endpoint hit22");

  const { fileId, worksheetName } = req.body;

  // 요청 데이터 검증
  if (!fileId || !worksheetName) {
    return res.status(400).json({ message: 'fileId and worksheetName are required.' });
  }

  try {
    // 학생 폴더 목록 가져오기
    const studentFolders = await getStudentFolderIds();
    console.log('Student folders:', studentFolders);

    // 파일을 각 학생 폴더로 복사
    await copyFileToStudentFolders(fileId, studentFolders, worksheetName);
    res.status(200).json({ message: 'Worksheet applied successfully.' });
  } catch (error) {
    console.error('Error applying worksheet:', error.message);
    res.status(500).json({ message: 'Failed to apply worksheet.' });
  }
});

module.exports = router;
