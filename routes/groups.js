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
// CREATE GROUP
// =====================================

router.post("/", requireLogin, (req, res) => {

  try {

    const name =
      (req.body.name || "").trim();

    const description =
      (req.body.description || "").trim();


    // ================================
    // VALIDATION
    // ================================

    if (!name) {

      return res.status(400).json({
        success: false,
        message: "Please enter a group name."
      });

    }

    if (name.length < 3) {

      return res.status(400).json({
        success: false,
        message:
          "Group name must be at least 3 characters."
      });

    }


    // ================================
    // CREATE GROUP
    // ================================

    const result =
      req.db
        .prepare(`
          INSERT INTO groups
          (
            name,
            description,
            created_by
          )
          VALUES (?, ?, ?)
        `)
        .run(
          name,
          description,
          req.session.userId
        );


    const groupId =
      result.lastInsertRowid;


    // ================================
    // ADD CREATOR AS OWNER
    // ================================

    req.db
      .prepare(`
        INSERT INTO group_members
        (
          group_id,
          user_id,
          role
        )
        VALUES (?, ?, ?)
      `)
      .run(
        groupId,
        req.session.userId,
        "owner"
      );


    // ================================
    // SUCCESS
    // ================================

    res.json({
      success: true,
      message: "Group created successfully.",
      group_id: groupId
    });


  } catch (error) {

    console.error(
      "CREATE GROUP ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to create group.",
      error:
        error.message
    });

  }

});

// =====================================
// GET ALL GROUPS
// =====================================

router.get("/", requireLogin, (req, res) => {

  try {

    const groups =
      req.db
        .prepare(`
          SELECT
            groups.id,
            groups.name,
            groups.description,
            groups.created_by,
            groups.created_at,
            users.name AS creator_name,

            (
              SELECT COUNT(*)
              FROM group_members
              WHERE group_members.group_id = groups.id
            ) AS member_count
,
(
  SELECT COUNT(*)
  FROM group_members
  WHERE group_members.group_id = groups.id
  AND group_members.user_id = ?
) AS is_member
          FROM groups

          JOIN users
            ON users.id = groups.created_by

          ORDER BY
            groups.created_at DESC,
            groups.id DESC
        `)
        .all(req.session.userId);

    res.json({
      success: true,
      groups
    });

  } catch (error) {

    console.error(
      "GET GROUPS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load groups.",
      error:
        error.message
    });

  }

});

// =====================================
// EXPORT ROUTER
// =====================================
// =====================================
// GET GROUP DETAILS
// =====================================

router.get("/:id", requireLogin, (req, res) => {

  try {

    const groupId =
      Number(req.params.id);

    if (!groupId) {

      return res.status(400).json({
        success: false,
        message: "Invalid group."
      });

    }

    // Get group information
    const group =
      req.db
        .prepare(`
          SELECT
            groups.id,
            groups.name,
            groups.description,
            groups.created_by,
            groups.created_at,
            users.name AS creator_name

          FROM groups

          JOIN users
            ON users.id = groups.created_by

          WHERE groups.id = ?
        `)
        .get(groupId);

    if (!group) {

      return res.status(404).json({
        success: false,
        message: "Group not found."
      });

    }


    // Get group members
    const members =
      req.db
        .prepare(`
          SELECT
            users.id,
            users.name,
            users.profile_photo,
            group_members.role,
            group_members.joined_at

          FROM group_members

          JOIN users
            ON users.id = group_members.user_id

          WHERE group_members.group_id = ?

          ORDER BY
            CASE
              WHEN group_members.role = 'owner'
              THEN 0
              ELSE 1
            END,
            users.name ASC
        `)
        .all(groupId);


    // Check current user's membership
    const membership =
      req.db
        .prepare(`
          SELECT
            role
          FROM group_members

          WHERE group_id = ?
          AND user_id = ?
        `)
        .get(
          groupId,
          req.session.userId
        );


    res.json({

      success: true,

      group,

      members,

      current_user: {
        id: req.session.userId,
        is_member: !!membership,
        role: membership
          ? membership.role
          : null
      }

    });

  } catch (error) {

    console.error(
      "GET GROUP DETAILS ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Unable to load group details.",

      error:
        error.message

    });

  }

});
// =====================================
// JOIN GROUP
// =====================================

router.post("/:id/join", requireLogin, (req, res) => {
  try {
    const groupId = Number(req.params.id);
    const userId = req.session.userId;

    const group = req.db
      .prepare("SELECT * FROM groups WHERE id = ?")
      .get(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found."
      });
    }

    // Check if already a member
    const existingMember = req.db
      .prepare(`
        SELECT *
        FROM group_members
        WHERE group_id = ? AND user_id = ?
      `)
      .get(groupId, userId);

    if (existingMember) {
      return res.json({
        success: true,
        message: "You are already a member of this group."
      });
    }

    // Add member
    req.db
      .prepare(`
        INSERT INTO group_members (group_id, user_id)
        VALUES (?, ?)
      `)
      .run(groupId, userId);

    res.json({
      success: true,
      message: "You joined the group successfully."
    });

  } catch (error) {
    console.error("JOIN GROUP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to join group."
    });
  }
});


// =====================================
// LEAVE GROUP
// =====================================

router.post("/:id/leave", requireLogin, (req, res) => {
  try {
    const groupId = Number(req.params.id);
   const userId = req.session.userId;

    const result = req.db
      .prepare(`
        DELETE FROM group_members
        WHERE group_id = ? AND user_id = ?
      `)
      .run(groupId, userId);

    if (result.changes === 0) {
      return res.json({
        success: true,
        message: "You are not a member of this group."
      });
    }

    res.json({
      success: true,
      message: "You left the group successfully."
    });

  } catch (error) {
    console.error("LEAVE GROUP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to leave group."
    });
  }
});
module.exports = router;