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
// GET ALL CHURCHES
// =====================================

router.get("/", requireLogin, (req, res) => {

  try {

    const churches = req.db.prepare(`
      SELECT
        churches.id,
        churches.name,
        churches.description,
        churches.address,
        churches.city,
        churches.country,
        churches.created_by,
        churches.created_at,
        users.name AS creator_name,

        (
          SELECT COUNT(*)
          FROM church_members
          WHERE church_members.church_id = churches.id
        ) AS member_count,

        (
          SELECT COUNT(*)
          FROM church_members
          WHERE church_members.church_id = churches.id
          AND church_members.user_id = ?
        ) AS is_member

      FROM churches

      JOIN users
        ON users.id = churches.created_by

      ORDER BY
        churches.created_at DESC,
        churches.id DESC

    `).all(req.session.userId);

    res.json({
      success: true,
      churches
    });

  } catch (error) {

    console.error(
      "GET CHURCHES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load churches."
    });

  }

});

// =====================================
// CREATE CHURCH
// =====================================

router.post("/", requireLogin, (req, res) => {

  try {

    const name =
      (req.body.name || "").trim();

    const description =
      (req.body.description || "").trim();

    const address =
      (req.body.address || "").trim();

    const city =
      (req.body.city || "").trim();

    const country =
      (req.body.country || "").trim();

    if (!name) {

      return res.status(400).json({
        success: false,
        message: "Please enter a church name."
      });

    }

    if (name.length < 3) {

      return res.status(400).json({
        success: false,
        message:
          "Church name must be at least 3 characters."
      });

    }

    const result = req.db.prepare(`
      INSERT INTO churches (
        name,
        description,
        address,
        city,
        country,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description,
      address,
      city,
      country,
      req.session.userId
    );

    const churchId =
      result.lastInsertRowid;

    // Creator automatically becomes church owner
    req.db.prepare(`
      INSERT INTO church_members (
        church_id,
        user_id,
        role
      )
      VALUES (?, ?, ?)
    `).run(
      churchId,
      req.session.userId,
      "owner"
    );

    res.json({
      success: true,
      message:
        "Church created successfully.",
      church_id: churchId
    });

  } catch (error) {

    console.error(
      "CREATE CHURCH ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to create church."
    });

  }

});
// =====================================
// JOIN CHURCH
// =====================================

router.post("/:id/join", requireLogin, (req, res) => {

  try {

    const churchId = Number(req.params.id);
    const userId = req.session.userId;

    // Check church exists
    const church = req.db.prepare(`
      SELECT id
      FROM churches
      WHERE id = ?
    `).get(churchId);

    if (!church) {

      return res.status(404).json({
        success: false,
        message: "Church not found."
      });

    }

    // Check if already a member
    const existingMember = req.db.prepare(`
      SELECT id
      FROM church_members
      WHERE church_id = ?
      AND user_id = ?
    `).get(churchId, userId);

    if (existingMember) {

      return res.json({
        success: true,
        message: "You are already a member of this church."
      });

    }

    // Add member
    req.db.prepare(`
      INSERT INTO church_members (
        church_id,
        user_id,
        role
      )
      VALUES (?, ?, ?)
    `).run(
      churchId,
      userId,
      "member"
    );

    res.json({
      success: true,
      message: "You joined the church successfully."
    });

  } catch (error) {

    console.error(
      "JOIN CHURCH ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to join church."
    });

  }

});
// =====================================
// LEAVE CHURCH
// =====================================

router.post("/:id/leave", requireLogin, (req, res) => {

  try {

    const churchId = Number(req.params.id);
    const userId = req.session.userId;

    // Check church exists
    const church = req.db.prepare(`
      SELECT id, created_by
      FROM churches
      WHERE id = ?
    `).get(churchId);

    if (!church) {

      return res.status(404).json({
        success: false,
        message: "Church not found."
      });

    }

    // Church owner cannot leave their own church
    if (church.created_by === userId) {

      return res.status(400).json({
        success: false,
        message: "The church owner cannot leave the church."
      });

    }

    // Check membership
    const member = req.db.prepare(`
      SELECT id
      FROM church_members
      WHERE church_id = ?
      AND user_id = ?
    `).get(churchId, userId);

    if (!member) {

      return res.json({
        success: true,
        message: "You are not a member of this church."
      });

    }

    // Remove member
    req.db.prepare(`
      DELETE FROM church_members
      WHERE church_id = ?
      AND user_id = ?
    `).run(
      churchId,
      userId
    );

    res.json({
      success: true,
      message: "You left the church successfully."
    });

  } catch (error) {

    console.error(
      "LEAVE CHURCH ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to leave church."
    });

  }

});
// =====================================
// GET CHURCH DETAILS
// =====================================

router.get("/:id", requireLogin, (req, res) => {

  try {

    const churchId = Number(req.params.id);
    const userId = req.session.userId;

    const church = req.db.prepare(`
      SELECT
        churches.id,
        churches.name,
        churches.description,
        churches.address,
        churches.city,
        churches.country,
        churches.created_by,
        churches.created_at,
        users.name AS creator_name,

        (
          SELECT COUNT(*)
          FROM church_members
          WHERE church_members.church_id = churches.id
        ) AS member_count,

        (
          SELECT COUNT(*)
          FROM church_members
          WHERE church_members.church_id = churches.id
          AND church_members.user_id = ?
        ) AS is_member

      FROM churches

      JOIN users
        ON users.id = churches.created_by

      WHERE churches.id = ?

    `).get(
      userId,
      churchId
    );

    if (!church) {

      return res.status(404).json({
        success: false,
        message: "Church not found."
      });

    }

    res.json({
      success: true,
      church
    });

  } catch (error) {

    console.error(
      "GET CHURCH DETAILS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load church details."
    });

  }

});
module.exports = router;