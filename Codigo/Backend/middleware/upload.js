const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
require('dotenv').config();

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      console.log('Multer GridFsStorage: file object:', file); // Add this line
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});

const upload = multer({ storage });

module.exports = upload;