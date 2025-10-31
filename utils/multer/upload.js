const multer = require('multer');
const path = require('path');
const fs = require('fs');


const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});


const allowedImageTypes = /jpeg|jpg|png|gif|webp/;


function fileFilter(req, file, cb) {
    const extname = allowedImageTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'));
    }
}


const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, 
    fileFilter: fileFilter,
});

module.exports = upload;
