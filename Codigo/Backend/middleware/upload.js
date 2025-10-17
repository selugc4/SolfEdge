const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const mongoose = require('mongoose');

let upload;

async function initGridFsStorage() {
  const conn = mongoose.connection;

  if (!conn.readyState) {
    await new Promise(resolve => conn.once('open', resolve));
  }

  const storage = new GridFsStorage({
    db: conn.db,
    file: (req, file) => ({
      filename: file.originalname,
      bucketName: 'uploads'
    })
  });

  upload = multer({ storage });
  console.log('Multer GridFS inicializado.');
}

function getUpload() {
  if (!upload) throw new Error('Multer GridFS no inicializado');
  return upload;
}

module.exports = { initGridFsStorage, getUpload };