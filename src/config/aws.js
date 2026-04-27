const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

const uploadToS3 = async (file, folder = 'uploads') => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${folder}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.log('S3 upload error:', error);
    return null;
  }
};

const deleteFromS3 = async (fileUrl) => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return;
  }

  try {
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(3).join('/');

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.log('S3 delete error:', error);
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3
};
