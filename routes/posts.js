const express = require("express");

const router = express.Router();

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
// CREATE POST
// =====================================

router.post("/", requireLogin, (req, res) => {
  try {
    const content = String(req.body.content || "").trim();

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Post cannot be empty."
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Post is too long. Maximum 5000 characters."
      });
    }

    const result = req.db
      .prepare(`
        INSERT INTO posts (user_id, content)
        VALUES (?, ?)
      `)
      .run(req.session.userId, content);

    const post = req.db
      .prepare(`
        SELECT
  posts.id,
  posts.content,
  posts.post_type,
  posts.media_url,
  posts.created_at,
  users.id AS user_id,
          users.name,
          users.email,
          users.profile_photo,
          0 AS amen_count,
          0 AS user_has_amen
        FROM posts
        JOIN users ON users.id = posts.user_id
        WHERE posts.id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create post."
    });
  }
});


// =====================================
// GET POSTS
// =====================================

router.get("/", (req, res) => {
  try {
    const currentUserId = req.session.userId || 0;

    const posts = req.db
      .prepare(`
        SELECT
  posts.id,
  posts.content,
  posts.post_type,
  posts.media_url,
  posts.created_at,
  users.id AS user_id,
          users.name,
          users.email,
          users.profile_photo,

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
        JOIN users ON users.id = posts.user_id
        ORDER BY posts.created_at DESC, posts.id DESC
        LIMIT 50
      `)
      .all(currentUserId);

    res.json({
      success: true,
      posts
    });

  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load posts."
    });
  }
});


// =====================================
// TOGGLE AMEN
// =====================================

router.post("/:id/amen", requireLogin, (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    const post = req.db
      .prepare(`
        SELECT id
        FROM posts
        WHERE id = ?
      `)
      .get(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    const existingAmen = req.db
      .prepare(`
        SELECT id
        FROM amens
        WHERE post_id = ?
          AND user_id = ?
      `)
      .get(postId, req.session.userId);

    let amened;

    if (existingAmen) {
      req.db
        .prepare(`
          DELETE FROM amens
          WHERE id = ?
        `)
        .run(existingAmen.id);

      amened = false;

    } else {
      req.db
        .prepare(`
          INSERT INTO amens (post_id, user_id)
          VALUES (?, ?)
        `)
        .run(postId, req.session.userId);

      amened = true;
    }

    const amenCount = req.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM amens
        WHERE post_id = ?
      `)
      .get(postId);

    res.json({
      success: true,
      amened,
      amen_count: amenCount.count
    });

  } catch (error) {
    console.error("TOGGLE AMEN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update Amen reaction."
    });
  }
});


// =====================================
// GET COMMENTS FOR A POST
// =====================================

router.get("/:id/comments", (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    const post = req.db
      .prepare(`
        SELECT id
        FROM posts
        WHERE id = ?
      `)
      .get(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    const comments = req.db
      .prepare(`
        SELECT
          comments.id,
          comments.post_id,
          comments.content,
          comments.created_at,
          users.id AS user_id,
          users.name,
          users.profile_photo
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC, comments.id ASC
      `)
      .all(postId);

    res.json({
      success: true,
      comments
    });

  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load comments."
    });
  }
});


// =====================================
// CREATE COMMENT
// =====================================

router.post("/:id/comments", requireLogin, (req, res) => {
  try {
    const postId = Number(req.params.id);
    const content = String(req.body.content || "").trim();

    if (!Number.isInteger(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty."
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment is too long. Maximum 2000 characters."
      });
    }

    const post = req.db
      .prepare(`
        SELECT id
        FROM posts
        WHERE id = ?
      `)
      .get(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    const result = req.db
      .prepare(`
        INSERT INTO comments (post_id, user_id, content)
        VALUES (?, ?, ?)
      `)
      .run(postId, req.session.userId, content);

    const comment = req.db
      .prepare(`
        SELECT
          comments.id,
          comments.post_id,
          comments.content,
          comments.created_at,
          users.id AS user_id,
          users.name,
          users.profile_photo
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.id = ?
      `)
      .get(result.lastInsertRowid);

    const count = req.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM comments
        WHERE post_id = ?
      `)
      .get(postId);

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment,
      comment_count: count.count
    });

  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create comment."
    });
  }
});


// =====================================
// DELETE COMMENT
// =====================================

router.delete("/comments/:commentId", requireLogin, (req, res) => {
  try {
    const commentId = Number(req.params.commentId);

    if (!Number.isInteger(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID."
      });
    }

    const comment = req.db
      .prepare(`
        SELECT user_id
        FROM comments
        WHERE id = ?
      `)
      .get(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found."
      });
    }

    if (comment.user_id !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments."
      });
    }

    req.db
      .prepare(`
        DELETE FROM comments
        WHERE id = ?
      `)
      .run(commentId);

    res.json({
      success: true,
      message: "Comment deleted successfully."
    });

  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete comment."
    });
  }
});


// =====================================
// DELETE POST
// =====================================

router.delete("/:id", requireLogin, (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    const post = req.db
      .prepare(`
        SELECT user_id
        FROM posts
        WHERE id = ?
      `)
      .get(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    if (post.user_id !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts."
      });
    }

    req.db
      .prepare(`
        DELETE FROM posts
        WHERE id = ?
      `)
      .run(postId);

    res.json({
      success: true,
      message: "Post deleted successfully."
    });

  } catch (error) {
    console.error("DELETE POST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete post."
    });
  }
});

// =====================================
// SHARE POST
// =====================================

router.post("/:id/share", requireLogin, (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID."
      });
    }

    const originalPost = req.db
      .prepare(`
        SELECT
          posts.id,
          posts.user_id,
          posts.content,
          posts.post_type,
          posts.media_url,
          users.name
        FROM posts
        JOIN users ON users.id = posts.user_id
        WHERE posts.id = ?
      `)
      .get(postId);

    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    let sharedContent = "";

    if (originalPost.post_type === "photo") {
      sharedContent =
        `Shared a post from ${originalPost.name}`;
    } else {
      sharedContent =
        `Shared a post from ${originalPost.name}\n\n${originalPost.content}`;
    }

    const result = req.db
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
        sharedContent,
        originalPost.post_type || "text",
        originalPost.media_url || null
      );

    res.status(201).json({
      success: true,
      message: "Post shared successfully.",
      post_id: result.lastInsertRowid
    });

  } catch (error) {
    console.error("SHARE POST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to share post."
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