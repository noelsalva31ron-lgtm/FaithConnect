const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const { UPLOADS_DIR } = require("../config/storage");

const router = express.Router();


// =====================================================
// PHOTO UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = UPLOADS_DIR;
// =====================================================
// MULTER STORAGE
// =====================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename =
      `profile-${req.session.userId}-${Date.now()}${extension}`;

    cb(null, filename);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
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
        new Error("Only JPG, PNG, WEBP and GIF images are allowed.")
      );
    }

    cb(null, true);
  }
});

// =====================================
// LOGIN REQUIRED
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
// FORGOT PASSWORD
// =====================================
router.post("/forgot-password", (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address."
      });
    }

    const user = req.db
      .prepare(`
        SELECT id, email
        FROM users
        WHERE email = ?
      `)
      .get(email);

    // Do not reveal whether an email exists.
    if (!user) {
      return res.json({
        message: "If an account exists with that email, a password reset link has been created."
      });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token expires after 30 minutes
    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString();

    // Remove old unused tokens for this user
    req.db
      .prepare(`
        UPDATE password_reset_tokens
        SET used = 1
        WHERE user_id = ? AND used = 0
      `)
      .run(user.id);

    // Save new token
    req.db
      .prepare(`
        INSERT INTO password_reset_tokens
        (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
      `)
      .run(
        user.id,
        tokenHash,
        expiresAt
      );

    // LOCALHOST TEST LINK
    const resetLink =
      `${req.protocol}://${req.get("host")}/reset-password?token=${rawToken}`;

    console.log("PASSWORD RESET LINK:");
    console.log(resetLink);

    res.json({
      message: "Password reset link created.",
      resetLink
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Unable to create password reset link."
    });
  }
});

// =====================================
// RESET PASSWORD
// =====================================
router.post("/reset-password", async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Invalid password reset request."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    // Hash the token so we can compare it
    // with the token stored in the database.
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetRecord = req.db
      .prepare(`
        SELECT id, user_id, expires_at, used
        FROM password_reset_tokens
        WHERE token_hash = ?
      `)
      .get(tokenHash);

    if (!resetRecord) {
      return res.status(400).json({
        message: "This password reset link is invalid."
      });
    }

    if (resetRecord.used) {
      return res.status(400).json({
        message: "This password reset link has already been used."
      });
    }

    if (
      new Date(resetRecord.expires_at).getTime() <
      Date.now()
    ) {
      return res.status(400).json({
        message: "This password reset link has expired."
      });
    }

    // Hash the new password using bcrypt.
    const hashedPassword =
      await bcrypt.hash(newPassword, 12);

    // Update the user's password.
    req.db
      .prepare(`
        UPDATE users
        SET password = ?
        WHERE id = ?
      `)
      .run(
        hashedPassword,
        resetRecord.user_id
      );

    // Mark this reset token as used.
    req.db
      .prepare(`
        UPDATE password_reset_tokens
        SET used = 1
        WHERE id = ?
      `)
      .run(resetRecord.id);

    res.json({
      message: "Password changed successfully."
    });

  } catch (error) {

    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to reset password."
    });
  }
});
// =====================================
// REGISTER
// =====================================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      beliefTrinity,
      beliefTongues,
      beliefHeavenHell,
      beliefEveryDayHoly,
      beliefMiracles
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }
    // =====================================
    // EVANGELICAL BELIEF REQUIREMENTS
    // =====================================

    const requiredBeliefs = [
      beliefTrinity,
      beliefTongues,
      beliefHeavenHell,
      beliefEveryDayHoly,
      beliefMiracles
    ];

    if (
      requiredBeliefs.some(
        answer => String(answer).toLowerCase() !== "yes"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Registration is available only to users who agree with all five FaithConnect belief requirements."
      });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = req.db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(cleanEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = req.db
      .prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `)
      .run(cleanName, cleanEmail, hashedPassword);

    req.session.userId = result.lastInsertRowid;

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: result.lastInsertRowid,
        name: cleanName,
        email: cleanEmail
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create account."
    });
  }
});

// =====================================
// LOGIN
// =====================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = req.db
      .prepare(`
        SELECT id, name, email, password, profile_photo, bio
        FROM users
        WHERE email = ?
      `)
      .get(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    req.session.userId = user.id;

    req.session.save((err) => {
      if (err) {
        console.error("SESSION SAVE ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Unable to save login session."
        });
      }

      res.json({
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_photo: user.profile_photo,
          bio: user.bio
        }
      });
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log in."
    });
  }
});

// =====================================
// CURRENT USER
// =====================================

router.get("/me", requireLogin, (req, res) => {

  const user = req.db
    .prepare(`
      SELECT id, name, email, profile_photo, bio, created_at
      FROM users
      WHERE id = ?
    `)
    .get(req.session.userId);

  if (!user) {

    req.session.destroy();

    return res.status(401).json({
      success: false,
      message: "User account no longer exists."
    });
  }

  res.json({
    success: true,
    user
  });
});

// =====================================
// UPLOAD PROFILE PHOTO
// =====================================

router.post(
  "/profile-photo",
  requireLogin,
  upload.single("profile_photo"),
  (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a profile photo."
        });
      }

      // Get current photo
      const currentUser = req.db
        .prepare(`
          SELECT profile_photo
          FROM users
          WHERE id = ?
        `)
        .get(req.session.userId);

      // Delete previous profile photo if it exists
      if (currentUser && currentUser.profile_photo) {

        const oldFilename = path.basename(
          currentUser.profile_photo
        );

        const oldFilePath = path.join(
          uploadDirectory,
          oldFilename
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Save new photo path in database
      const photoPath = `/uploads/${req.file.filename}`;

      req.db
        .prepare(`
          UPDATE users
          SET profile_photo = ?
          WHERE id = ?
        `)
        .run(photoPath, req.session.userId);

      res.json({
        success: true,
        message: "Profile photo uploaded successfully.",
        profile_photo: photoPath
      });

    } catch (error) {

      console.error("PROFILE PHOTO ERROR:", error);

      // Remove uploaded file if database update fails
      if (req.file) {
        const uploadedFile = path.join(
          uploadDirectory,
          req.file.filename
        );

        if (fs.existsSync(uploadedFile)) {
          fs.unlinkSync(uploadedFile);
        }
      }

      res.status(500).json({
        success: false,
        message: "Unable to upload profile photo."
      });
    }
  }
);

// =====================================
// LOGOUT
// =====================================

router.post("/logout", requireLogin, (req, res) => {

  req.session.destroy((error) => {

    if (error) {
      console.error("LOGOUT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to log out."
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully."
    });
  });
});

// =====================================
// GET ALL USERS
// =====================================

router.get("/users", requireLogin, (req, res) => {
  try {
    const users = req.db
      .prepare(`
        SELECT
          users.id,
          users.name,
          users.email,
          users.profile_photo,
          users.bio,

          (
            SELECT COUNT(*)
            FROM follows
            WHERE follows.following_id = users.id
          ) AS followers_count,

          (
            SELECT COUNT(*)
            FROM follows
            WHERE follows.follower_id = users.id
          ) AS following_count,

          EXISTS (
            SELECT 1
            FROM follows
            WHERE follows.follower_id = ?
              AND follows.following_id = users.id
          ) AS is_following

        FROM users
        WHERE users.id != ?
        ORDER BY users.name ASC
      `)
      .all(req.session.userId, req.session.userId);

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load users."
    });
  }
});

// =====================================
// GET USER PROFILE
// =====================================

router.get("/users/:id", requireLogin, (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const user = req.db
      .prepare(`
        SELECT
          id,
          name,
          email,
          profile_photo,
          bio,
          created_at
        FROM users
        WHERE id = ?
      `)
      .get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const followersCount = req.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM follows
        WHERE following_id = ?
      `)
      .get(userId).count;

    const followingCount = req.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM follows
        WHERE follower_id = ?
      `)
      .get(userId).count;

    const postsCount = req.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM posts
        WHERE user_id = ?
      `)
      .get(userId).count;

    const isFollowing = Boolean(
      req.db
        .prepare(`
          SELECT id
          FROM follows
          WHERE follower_id = ?
            AND following_id = ?
        `)
        .get(req.session.userId, userId)
    );

    const posts = req.db
      .prepare(`
        SELECT
          posts.id,
          posts.content,
          posts.created_at,

          (
            SELECT COUNT(*)
            FROM amens
            WHERE amens.post_id = posts.id
          ) AS amen_count,

          EXISTS (
            SELECT 1
            FROM amens
            WHERE amens.post_id = posts.id
              AND amens.user_id = ?
          ) AS user_has_amen,

          (
            SELECT COUNT(*)
            FROM comments
            WHERE comments.post_id = posts.id
          ) AS comment_count

        FROM posts
        WHERE posts.user_id = ?

        ORDER BY posts.created_at DESC, posts.id DESC
        LIMIT 50
      `)
      .all(req.session.userId, userId);

    res.json({
      success: true,

      user,

      stats: {
        followers_count: followersCount,
        following_count: followingCount,
        posts_count: postsCount
      },

      is_following: isFollowing,

      posts
    });

  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load user profile."
    });
  }
});

// =====================================
// FOLLOW USER
// =====================================

router.post("/users/:id/follow", requireLogin, (req, res) => {
  try {
    const followingId = Number(req.params.id);
    const followerId = req.session.userId;

    if (!Number.isInteger(followingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself."
      });
    }

    const user = req.db
      .prepare(`
        SELECT id
        FROM users
        WHERE id = ?
      `)
      .get(followingId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const existingFollow = req.db
      .prepare(`
        SELECT id
        FROM follows
        WHERE follower_id = ?
          AND following_id = ?
      `)
      .get(followerId, followingId);

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: "You are already following this user."
      });
    }

    req.db
      .prepare(`
        INSERT INTO follows (follower_id, following_id)
        VALUES (?, ?)
      `)
      .run(followerId, followingId);

    const followersCount = req.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM follows
        WHERE following_id = ?
      `)
      .get(followingId).count;

    res.status(201).json({
      success: true,
      following: true,
      followers_count: followersCount
    });

  } catch (error) {
    console.error("FOLLOW ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to follow user."
    });
  }
});

// =====================================
// UNFOLLOW USER
// =====================================

router.delete("/users/:id/follow", requireLogin, (req, res) => {
  try {
    const followingId = Number(req.params.id);
    const followerId = req.session.userId;

    if (!Number.isInteger(followingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const result = req.db
      .prepare(`
        DELETE FROM follows
        WHERE follower_id = ?
          AND following_id = ?
      `)
      .run(followerId, followingId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user."
      });
    }

    const followersCount = req.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM follows
        WHERE following_id = ?
      `)
      .get(followingId).count;

    res.json({
      success: true,
      following: false,
      followers_count: followersCount
    });

  } catch (error) {
    console.error("UNFOLLOW ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to unfollow user."
    });
  }
});
// =====================================
// GET ALL PRAYER REQUESTS
// =====================================

router.get(
  "/",
  requireLogin,
  (req, res) => {

    try {

      const currentUserId =
        req.session.userId;

      const prayers =
        req.db
          .prepare(`
            SELECT
              posts.id,
              posts.user_id,
              posts.created_at,

              posts.prayer_title,
              posts.prayer_request,
              posts.prayer_message,

              posts.prayer_answered,
              posts.prayer_answered_at,

              users.name,
              users.profile_photo,

              (
                SELECT COUNT(*)
                FROM prayer_prayers
                WHERE prayer_prayers.post_id = posts.id
              ) AS prayer_count,

              EXISTS (
                SELECT 1
                FROM prayer_prayers
                WHERE prayer_prayers.post_id = posts.id
                  AND prayer_prayers.user_id = ?
              ) AS user_has_prayed

            FROM posts

            JOIN users
              ON users.id = posts.user_id

            WHERE posts.post_type = 'prayer_request'

            ORDER BY
              posts.created_at DESC,
              posts.id DESC
          `)
          .all(currentUserId);


      res.json({
        success: true,
        prayers
      });


    } catch (error) {

      console.error(
        "GET PRAYER REQUESTS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load Prayer Requests."
      });

    }

  }
);
module.exports = router;

