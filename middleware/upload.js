import multer from 'multer';
import multer3 from 'multer-s3'
import { s3 } from "../config/s3.js";


export const upload = multer({
    storage:multer3({
        s3:s3,
        bucket:process.env.AWS_BUCKET_NAME,
          contentType: multer3.AUTO_CONTENT_TYPE,
       key: function (req, file, cb) {
        const fileName = Date.now() + "-" + (file.originalname || "image.jpg");
        cb(null, `data/${fileName}`);
}

    })
})

