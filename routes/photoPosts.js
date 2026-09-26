const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { UPLOADS_DIR } = require("../config/storage");

const router = express.Router();


// =====================================================
// PHOTO UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
    UPLOADS_DIR,
    "photo-posts"
);

fs.mkdirSync(uploadDirectory, { recursive: true });
// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {

    const extension =
      path.extname(file.originalname).toLowerCase();

    const filename =
      `photo-${req.session.userId}-${Date.now()}${extension}`;

    cb(null, filename);
  }

});


// =====================================================
// MULTER UPLOAD SETTINGS
// =====================================================

const upload = multer({

  storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (!allowedTypes.includes(file.mimetype)) {

      return cb(
        new Error(
          "Only JPG, PNG, WEBP and GIF images are allowed."
        )
      );

    }

    cb(null, true);
  }

});


// =====================================================
// LOGIN CHECK
// =====================================================

function requireLogin(req, res, next) {

  if (!req.session.userId) {

    return res.status(401).json({
      success: false,
      message: "Please log in first."
    });

  }

  next();
}


// =====================================================
// TEST ROUTE
// =====================================================

router.get("/test", (req, res) => {

  res.json({
    success: true,
    message: "Photo post route is working!"
  });

});


// =====================================================
// CREATE PHOTO POST
// =====================================================

router.post(
  "/",
  requireLogin,
  upload.single("photo"),

  (req, res) => {

    try {

      // -----------------------------------------------
      // CHECK PHOTO
      // -----------------------------------------------

      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: "Please select a photo."
        });

      }


      // -----------------------------------------------
      // CAPTION
      // -----------------------------------------------

      const caption =
        (req.body.caption || "").trim();


      // -----------------------------------------------
      // PHOTO URL
      // -----------------------------------------------

      const photoUrl =
        `/uploads/photo-posts/${req.file.filename}`;


      // -----------------------------------------------
      // SAVE TO DATABASE
      // -----------------------------------------------

      const result =
        req.db
          .prepare(`
            INSERT INTO posts
            (
              user_id,
              content,
              post_type,
              media_url
            )
            VALUES (?, ?, ?, ?)
          `)
          .run(
            req.session.userId,
            caption,
            "photo",
            photoUrl
          );


      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      res.json({

        success: true,

        message:
          "Photo posted successfully.",

        post_id:
          result.lastInsertRowid,

        photo_url:
          photoUrl

      });

    }


    // -----------------------------------------------
    // ERROR
    // -----------------------------------------------

    catch (error) {

      console.error(
        "PHOTO POST ERROR:",
        error
      );


      // Delete uploaded photo
      // if database insertion failed

      if (req.file) {

        const uploadedFile =
          path.join(
            uploadDirectory,
            req.file.filename
          );

        if (fs.existsSync(uploadedFile)) {

          fs.unlinkSync(
            uploadedFile
          );

        }

      }


      res.status(500).json({

        success: false,

        message:
          "Unable to create photo post.",

        error:
          error.message

      });

    }

  }
);


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (error, req, res, next) => {

    console.error(
      "PHOTO UPLOAD ERROR:",
      error
    );

    if (error instanceof multer.MulterError) {

      if (error.code === "LIMIT_FILE_SIZE") {

        return res.status(400).json({

          success: false,

          message:
            "Photo must be smaller than 10 MB."

        });

      }

    }


    res.status(400).json({

      success: false,

      message:
        error.message ||
        "Unable to upload photo."

    });

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;