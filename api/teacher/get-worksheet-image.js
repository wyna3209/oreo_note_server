const express = require('express');
const router = express.Router();
const { drive, getFile } = require('../../drive/drive');
const path = require('path');
const fs = require('fs');
const os = require('os');



// Get the current worksheet URL
router.get('/:fileId', async (req, res) => {
  const fileId = req.params.fileId;

  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', 'image/jpeg'); // 이미지 MIME 타입 설정 (예시: jpeg)
    response.data
      .on('end', () => {
        console.log('Image successfully sent to the client.');
      })
      .on('error', (err) => {
        console.error('Error downloading image:', err);
        res.status(500).send('Error downloading image');
      })
      .pipe(res);
  } catch (error) {
    console.error('Error accessing Google Drive:', error);
    res.status(500).send('Error accessing Google Drive');
  }
});

// Google Drive에서 PDF 파일을 다운로드하여 클라이언트에 전송하는 엔드포인트
router.get('/get-pdf/:fileId', async (req, res) => {
  const fileId = req.params.fileId;

  try {
    // Google Drive에서 PDF 파일을 스트림으로 가져오기
    const response = await getFile(fileId, 'application/pdf');

    // 임시 디렉토리에 PDF 파일을 저장
    const tempDir = os.tmpdir(); // 임시 디렉토리 경로
    const tempPdfPath = path.join(tempDir, `${fileId}.pdf`);
    const writeStream = fs.createWriteStream(tempPdfPath);

    // 스트림을 파일로 저장
    response.data.pipe(writeStream);

    writeStream.on('finish', () => {
      // PDF 파일이 성공적으로 저장되면 클라이언트로 전송
      res.download(tempPdfPath, `${fileId}.pdf`, (err) => {
        if (err) {
          console.error('Error sending PDF file:', err);
          res.status(500).send('Error downloading PDF');
        }

        // 파일 전송 후 임시 파일 삭제
        fs.unlinkSync(tempPdfPath);
      });
    });

    writeStream.on('error', (err) => {
      console.error('Error writing PDF file:', err);
      res.status(500).send('Error processing PDF file');
    });
  } catch (error) {
    console.error('Error accessing Google Drive or processing PDF:', error);
    res.status(500).send('Error processing request');
  }
});
module.exports = router;
