var AWS = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');


AWS.config.update({
  accessKeyId: `${process.env.ACCESS_KEY}`,
  secretAccessKey: `${process.env.SECRET_KEY}`,
  region: `${process.env.REGION}`
});
var s3 = new AWS.S3({});

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKETNAME,
    // acl : 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname)
    }
  })
});

module.exports = upload