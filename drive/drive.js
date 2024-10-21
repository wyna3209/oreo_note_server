const { google } = require('googleapis');
const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');


const SCOPES = ['https://www.googleapis.com/auth/drive'];
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);


// GoogleAuth를 사용하여 인증 설정
const auth = new GoogleAuth({
  credentials: credentials,  // 서비스 계정 키 파일의 경로
  scopes: SCOPES,
});


const drive = google.drive({ version: 'v3', auth: auth });


const listFiles = async (folderId, folderName = '') => {
  try {
    // 폴더 ID를 기반으로 하위 파일 및 폴더를 가져옴gg
    let query = `'${folderId}' in parents and trashed=false`;

    if (folderName) {
      // 폴더 이름이 주어졌을 때, 해당 이름을 가진 하위 폴더를 검색
      query += ` and name='${folderName}' and mimeType='application/vnd.google-apps.folder'`;
    }

    const folderRes = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, modifiedTime)',
      spaces: 'drive',
    });

    if (folderName && folderRes.data.files.length > 0) {
      // 폴더 이름이 주어졌고, 해당 이름을 가진 폴더가 있을 경우
      const specificFolderId = folderRes.data.files[0].id;

      // 해당 폴더의 하위 파일 및 폴더 가져오기
      const res = await drive.files.list({
        q: `'${specificFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, modifiedTime)',
        spaces: 'drive',
      });

      return res.data.files;
    } else {
      // 폴더 이름이 주어지지 않았거나, 해당 폴더 이름이 없을 경우
      return folderRes.data.files;
    }
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getFolderIdByName = async (folderName, parentFolderId) => {
  try {
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const folders = res.data.files;
    if (folders.length === 0) {
      console.log('Folder not found');
      return null;
    }

    return folders[0].id;
  } catch (error) {
    console.error('Error finding folder:', error);
    throw error;
  }
};

// 학생별 폴더 생성 확인 및 생성
const ensureStudentFolderExists = async (studentName) => {
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${studentName}'`,
    fields: 'files(id, name)',
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folderMetadata = {
    name: studentName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    resource: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
};

// 이미지 업로드
const uploadImage = async (fileName, filePath, folderId) => {
  try {
    const fileMetadata = {
      name: String(fileName), // 파일 이름을 문자열로 변환하여 명확히 설정
      parents: [folderId], // 업로드할 폴더 ID
    };

    const media = {
      mimeType: 'image/png', // 업로드할 이미지의 MIME 타입
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name',
    });

    return file.data;
  } catch (error) {
    console.error('Error uploading image to Google Drive:', error);
    throw error;
  }
};
// 특정 파일을 가져오는 함수
const getFile = async (fileId, mimeType) => {
  try {
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    );

    return response; // 스트림을 반환하여 pipe로 연결할 수 있게 합니다.
  } catch (error) {
    console.error('Error retrieving file from Google Drive:', error);
    throw error;
  }
};


// 폴더 생성 함수
async function createFolder(folderName, parentFolderId) {
  try {
    const fileMetadata = {
      'name': folderName,
      'mimeType': 'application/vnd.google-apps.folder',
      'parents': [parentFolderId] // 부모 폴더 ID 설정
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    const folderId = response.data.id;
    console.log(`Folder '${folderName}' created with ID: ${folderId}`);
    return folderId;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error('Folder creation failed');
  }
}


module.exports = {
  drive,
  listFiles,
  getFolderIdByName,
  ensureStudentFolderExists,
  uploadImage,
  getFile,
  createFolder
};
