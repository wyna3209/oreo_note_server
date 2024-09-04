const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
// const credentials = require('/credentials.json');

const auth = new GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth: auth });


// 학생 폴더 생성 함수
const createStudentFolders = async () => {
  const studentsFolderId = '1Z0-J2U0vg9oQRcWLnFgKRgwEyJnfIA16';

  if (!studentsFolderId) {
    console.error('Cannot proceed without Students folder ID.');
    return;
  }

  const studentNames = Array.from({ length: 23 }, (_, i) => `학생${i + 1}`);

  for (const studentName of studentNames) {
    try {
      // 폴더가 이미 존재하는지 확인 (Students 폴더 내에서)
      const res = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${studentName}' and '${studentsFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });

      if (res.data.files.length > 0) {
        console.log(`Folder for ${studentName} already exists.`);
        continue;
      }

      // 학생 폴더 생성
      const folderMetadata = {
        name: studentName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [studentsFolderId], // Students 폴더 ID를 부모 폴더로 설정
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });

      console.log(`Created folder for ${studentName}: ${folder.data.id}`);
    } catch (error) {
      console.error(`Error creating folder for ${studentName}:`, error.message);
    }
  }
};

// 실행
createStudentFolders()
  .then(() => console.log('All folders created.'))
  .catch((error) => console.error('Error during folder creation:', error));
