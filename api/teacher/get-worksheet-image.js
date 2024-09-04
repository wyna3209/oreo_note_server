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


// PDF 파일을 이미지로 변환하여 클라이언트로 전송하는 엔드포인트
router.get('/pdf-to-img/:fileId', async (req, res) => {
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

    writeStream.on('finish', async () => {
      try {
        const { pdf } = await import('pdf-to-img');

        // PDF 파일을 이미지로 변환
        const document = await pdf(tempPdfPath, { scale: 2.0 });
        const images = [];

        for await (const image of document) {
          images.push(image.toString('base64'));
        }

        // 클라이언트로 이미지를 전송
        res.json({ images });

        // 임시 파일 삭제
        fs.unlinkSync(tempPdfPath); // PDF 파일 삭제

      } catch (conversionError) {
        console.error('Error during PDF to image conversion:', conversionError);
        res.status(500).send('Error processing PDF to image conversion');
      }
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
