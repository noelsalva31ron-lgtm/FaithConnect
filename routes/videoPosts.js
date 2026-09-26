const express = require("express");
const multer = require("multer");
const path = require("path");

const { UPLOADS_DIR } = require("../config/storage");

const router = express.Router();


// =====================================================
// VIDEO UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
    UPLOADS_DIR,
    "video-posts"
);


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
      "video-" +
      req.session.userId +
      "-" +
      Date.now() +
      extension;

    cb(null, filename);

  }

});


// =====================================================
// MULTER UPLOAD SETTINGS
// =====================================================

const upload = multer({

  storage: storage,

  limits: {
    fileSize: 100 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime"
    ];

    if (!allowedTypes.includes(file.mimetype)) {

      return cb(
        new Error(
          "Only MP4, WEBM, OGG and MOV videos are allowed."
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

    message: "Video post route is working!"

  });

});


// =====================================================
// CREATE VIDEO POST
// =====================================================

router.post(
  "/",
  requireLogin,
  upload.single("video"),

  (req, res) => {

    try {

      // -----------------------------------------------
      // CHECK VIDEO
      // -----------------------------------------------

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message: "Please select a video."

        });

      }


      // -----------------------------------------------
      // CAPTION
      // -----------------------------------------------

      const caption =
        (req.body.caption || "").trim();


      // -----------------------------------------------
      // VIDEO URL
      // -----------------------------------------------

      const videoUrl =
        "/uploads/video-posts/" +
        req.file.filename;


      // -----------------------------------------------
      // SAVE TO DATABASE
      // -----------------------------------------------

      const result =
        req.db
          .prepare(
            `
            INSERT INTO posts
            (
              user_id,
              content,
              post_type,
              media_url
            )
            VALUES (?, ?, ?, ?)
            `
          )
          .run(
            req.session.userId,
            caption,
            "video",
            videoUrl
          );


      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      res.json({

        success: true,

        message: "Video posted successfully.",

        post_id: result.lastInsertRowid,

        video_url: videoUrl

      });

    }


    // -----------------------------------------------
    // DATABASE / SERVER ERROR
    // -----------------------------------------------

    catch (error) {

      console.error(
        "VIDEO POST ERROR:",
        error
      );


      // ---------------------------------------------
      // DELETE VIDEO IF DATABASE SAVE FAILED
      // ---------------------------------------------

      if (req.file) {

        const uploadedFile =
          path.join(
            uploadDirectory,
            req.file.filename
          );

        if (fs.existsSync(uploadedFile)) {

          try {

            fs.unlinkSync(uploadedFile);

          } catch (deleteError) {

            console.error(
              "VIDEO DELETE ERROR:",
              deleteError
            );

          }

        }

      }


      res.status(500).json({

        success: false,

        message: "Unable to create video post.",

        error: error.message

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
      "VIDEO UPLOAD ERROR:",
      error
    );


    // -----------------------------------------------
    // FILE TOO LARGE
    // -----------------------------------------------

    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Video must be smaller than 100 MB."

      });

    }


    // -----------------------------------------------
    // OTHER UPLOAD ERRORS
    // -----------------------------------------------

    res.status(400).json({

      success: false,

      message:
        error.message ||
        "Unable to upload video."

    });

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;

