const express = require("express");
const path = require("path");
const multer = require("multer");

const { UPLOADS_DIR } = require("../config/storage");

const router = express.Router();


// =====================================
// SINGLE CHRISTIAN PHOTO UPLOAD
// =====================================

const uploadDirectory =
    path.join(
        UPLOADS_DIR,
        "single-christians"
    );



// Storage settings
const singleChristianStorage =
  multer.diskStorage({

    destination: (req, file, cb) => {

      cb(
        null,
        uploadDirectory
      );

    },

    filename: (req, file, cb) => {

      const extension =
        path
          .extname(file.originalname)
          .toLowerCase();

      const filename =
        `single-${req.session.userId}-${Date.now()}${extension}`;

      cb(
        null,
        filename
      );

    }

  });


// Upload settings
const singleChristianUpload =
  multer({

    storage:
      singleChristianStorage,

    limits: {
      fileSize:
        5 * 1024 * 1024
    },

    fileFilter:
      (req, file, cb) => {

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif"
        ];

        if (
          allowedTypes.includes(
            file.mimetype
          )
        ) {

          cb(null, true);

        } else {

          cb(
            new Error(
              "Only JPG, PNG, WEBP and GIF images are allowed."
            )
          );

        }

      }

  });


// Safe upload middleware
function uploadSingleChristianPhoto(
  req,
  res,
  next
) {

  singleChristianUpload.single(
    "profilePhoto"
  )(
    req,
    res,
    function (error) {

      if (error) {

        return res.status(400).json({

          success: false,

          message:
            error.message ||
            "Unable to upload the profile photo."

        });

      }

      next();

    }
  );

}


// =====================================
// LOGIN CHECK
// =====================================

function requireLogin(req, res, next) {

  if (!req.session.userId) {

    return res.status(401).json({
      success: false,
      message: "You must be logged in."
    });

  }

  next();

}


// =====================================
// CREATE SINGLE CHRISTIAN PROFILE
// =====================================

router.post(
  "/",
  requireLogin,
  uploadSingleChristianPhoto,
  (req, res) => {

  try {

    const {
  fullName,
  age,
  country,
  churchName,
  occupation,
  aboutMe,
  lookingFor,
  additionalInfo,
  profilePhoto
} = req.body || {};


    // =====================================
    // REQUIRED INFORMATION
    // =====================================

    if (
      !fullName ||
      !age ||
      !country
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Please enter your name, age and country."
      });

    }


    // =====================================
    // AGE CHECK
    // =====================================

    const numericAge =
      Number(age);

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 18 ||
      numericAge > 100
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Single Christian profiles are for users 18 years and older."
      });

    }


    // =====================================
    // CHECK EXISTING PROFILE
    // =====================================

    const existingProfile =
      req.db
        .prepare(`
          SELECT id
          FROM single_christian_profiles
          WHERE user_id = ?
        `)
        .get(req.session.userId);


    if (existingProfile) {

      return res.status(409).json({
        success: false,
        message:
          "You already have a Single Christian profile."
      });

    }


    // =====================================
    // SAVE PROFILE
    // =====================================

    const result =
      req.db
        .prepare(`
          INSERT INTO single_christian_profiles
          (
            user_id,
            full_name,
            age,
            country,
            church_name,
            occupation,
            about_me,
            looking_for,
            additional_info,
            profile_photo
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          req.session.userId,
          fullName.trim(),
          numericAge,
          country.trim(),
          churchName
            ? churchName.trim()
            : null,
          occupation
            ? occupation.trim()
            : null,
          aboutMe
            ? aboutMe.trim()
            : null,
          lookingFor
            ? lookingFor.trim()
            : null,
          additionalInfo
            ? additionalInfo.trim()
            : null,
          profilePhoto || null
        );


    // =====================================
    // SUCCESS
    // =====================================

    res.json({

      success: true,

      message:
        "Your Single Christian profile has been created.",

      profileId:
        result.lastInsertRowid

    });

  } catch (error) {

    console.error(
      "CREATE SINGLE CHRISTIAN PROFILE ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Unable to create your profile."

    });

  }

});


// =====================================
// GET ALL SINGLE CHRISTIAN PROFILES
// =====================================

router.get("/", requireLogin, (req, res) => {

  try {

    const profiles =
      req.db
        .prepare(`
          SELECT
            scp.id,
            scp.user_id,
            scp.full_name,
            scp.age,
            scp.country,
            scp.church_name,
            scp.occupation,
            scp.about_me,
            scp.looking_for,
            scp.additional_info,
            scp.profile_photo,
            scp.created_at
          FROM single_christian_profiles scp
          ORDER BY scp.created_at DESC
        `)
        .all();

    res.json({
      success: true,
      profiles
    });

  } catch (error) {

    console.error(
      "GET ALL SINGLE CHRISTIAN PROFILES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load Single Christian profiles."
    });

  }

});
router.get("/me", requireLogin, (req, res) => {

  try {

    const profile =
      req.db
        .prepare(`
          SELECT *
          FROM single_christian_profiles
          WHERE user_id = ?
        `)
        .get(req.session.userId);


    res.json({

      success: true,

      profile: profile || null

    });

  } catch (error) {

    console.error(
      "GET MY SINGLE CHRISTIAN PROFILE ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Unable to load your profile."

    });

  }

});

// =====================================
// UPDATE SINGLE CHRISTIAN PROFILE PHOTO
// =====================================

router.put(
  "/me/photo",
  requireLogin,
  uploadSingleChristianPhoto,
  (req, res) => {

    try {

      // Make sure a photo was selected
      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please select a profile photo."

        });

      }


      // Check that profile exists
      const existingProfile =
        req.db
          .prepare(`
            SELECT id
            FROM single_christian_profiles
            WHERE user_id = ?
          `)
          .get(req.session.userId);


      if (!existingProfile) {

        return res.status(404).json({

          success: false,

          message:
            "You do not have a Single Christian profile yet."

        });

      }


      // Photo URL saved in database
      const profilePhoto =
        `/uploads/single-christians/${req.file.filename}`;


      // Save photo
      req.db
        .prepare(`
          UPDATE single_christian_profiles
          SET
            profile_photo = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `)
        .run(
          profilePhoto,
          req.session.userId
        );


      res.json({

        success: true,

        message:
          "Your profile photo has been updated.",

        profilePhoto

      });

    } catch (error) {

      console.error(
        "UPDATE SINGLE CHRISTIAN PHOTO ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to update your profile photo."

      });

    }

  }
);
module.exports = router;