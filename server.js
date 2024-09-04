const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');


// Import API routes
const driveFolderRouter = require('./drive/drive-folder');
const teacherApplyWorksheetRouter = require('./api/teacher/apply-worksheet');
const teacherGetImageWorksheetRouter = require('./api/teacher/get-worksheet-image');
const teacherUploadImageRouter = require('./api/teacher/upload-image');

const studentGetWorksheetsRouter = require('./api/student/get-worksheets');
const studentSubmitWorksheetRouter = require('./api/student/submit-worksheet');


app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));

// Use API routes
app.use('/drive/drive-folder', driveFolderRouter);
app.use('/api/teacher/apply-worksheet', teacherApplyWorksheetRouter);

app.use('/api/teacher/get-worksheet-image', teacherGetImageWorksheetRouter);
app.use('/api/teacher/upload-image', teacherUploadImageRouter);

app.use('/api/student/get-worksheets', studentGetWorksheetsRouter);
app.use('/api/student/submit-worksheet', studentSubmitWorksheetRouter);

// Serve static files (for uploaded images, if necessary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
