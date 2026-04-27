const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToS3 } = require('../config/aws');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'), false);
  }
};

const uploadLocal = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  }
});

const uploadCloud = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  }
});

const upload = async (req, res, next) => {
  try {
    // Check if S3 is enabled and credentials are provided
    if (process.env.S3_ENABLED === 'true' && 
        process.env.AWS_ACCESS_KEY_ID && 
        process.env.AWS_SECRET_ACCESS_KEY && 
        process.env.AWS_S3_BUCKET) {
      
      uploadCloud.single('file')(req, res, async (err) => {
        if (err) return next(err);
        
        if (req.file) {
          const s3Url = await uploadToS3(req.file);
          if (s3Url) {
            req.file.cloudUrl = s3Url;
            req.file.path = s3Url;
          }
        }
        next();
      });
    } else {
      // Use local storage
      uploadLocal.single('file')(req, res, next);
    }
  } catch (error) {
    next(error);
  }
};

// Also export the local upload for direct use
const uploadLocalSingle = uploadLocal.single('file');

module.exports = upload;
module.exports.uploadLocal = uploadLocal;
module.exports.uploadLocalSingle = uploadLocalSingle;
