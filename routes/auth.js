const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// =====================================
// PROFILE PHOTO UPLOAD
// =====================================

const uploadDirectory = path.join(__dirname, "..", "uploads");

// Make sure uploads folder exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

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

