const express = require("express");
const router = express.Router();

// =====================================
// REQUIRE LOGIN
// =====================================

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Please log in first."
    });
  }

  next();
}

// =====================================
// CHECK GROUP MEMBERSHIP
// =====================================

function requireGroupMember(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Invalid group."
      });
    }

    const membership = req.db.prepare(`
      SELECT *
      FROM group_members
      WHERE group_id = ?
      AND user_id = ?
    `).get(groupId, req.session.userId);

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You must join this group first."
      });
    }

    next();

  } catch (error) {
    console.error("GROUP MEMBERSHIP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to check group membership."
    });
  }
}

// =====================================
// CREATE GROUP POST
// =====================================

router.post(
  "/:groupId",
  requireLogin,
  requireGroupMember,
  (req, res) => {

    try {

      const groupId = Number(req.params.groupId);
      const content = (req.body.content || "").trim();

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Please write something."
        });
      }

      const result = req.db.prepare(`
        INSERT INTO group_posts (
          group_id,
          user_id,
          content
        )
        VALUES (?, ?, ?)
      `).run(
        groupId,
        req.session.userId,
        content
      );

      res.json({
        success: true,
        message: "Group post created successfully.",
        post_id: result.lastInsertRowid
      });

    } catch (error) {

      console.error("CREATE GROUP POST ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Unable to create group post."
      });
    }
  }
);

// =====================================
// GET GROUP POSTS
// =====================================

router.get(
  "/:groupId",
  requireLogin,
  (req, res) => {

    try {

      const groupId = Number(req.params.groupId);

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: "Invalid group."
        });
      }

      const posts = req.db.prepare(`
        SELECT
          group_posts.id,
          group_posts.group_id,
          group_posts.user_id,
          group_posts.content,
          group_posts.created_at,
          users.name AS user_name,
          users.profile_photo
        FROM group_posts
        JOIN users
          ON users.id = group_posts.user_id
        WHERE group_posts.group_id = ?
        ORDER BY group_posts.created_at DESC,
                 group_posts.id DESC
      `).all(groupId);

      res.json({
        success: true,
        posts
      });

    } catch (error) {

      console.error("GET GROUP POSTS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Unable to load group posts."
      });
    }
  }
);

module.exports = router;