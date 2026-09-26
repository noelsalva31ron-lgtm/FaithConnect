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
// GET ALL USERS FOR MESSAGING
// =====================================

router.get("/users", requireLogin, (req, res) => {

  try {

    const users = req.db.prepare(`
      SELECT
        id,
        name,
        profile_photo
      FROM users
      WHERE id != ?
      ORDER BY name ASC
    `).all(req.session.userId);

    res.json({
      success: true,
      users
    });

  } catch (error) {

    console.error(
      "GET MESSAGE USERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load users."
    });

  }

});

// =====================================
// GET CONVERSATION
// =====================================

router.get("/:userId", requireLogin, (req, res) => {

  try {

    const currentUserId =
      req.session.userId;

    const otherUserId =
      Number(req.params.userId);

    if (!otherUserId) {

      return res.status(400).json({
        success: false,
        message: "Invalid user."
      });

    }

    // Make sure other user exists
    const otherUser = req.db.prepare(`
      SELECT
        id,
        name,
        profile_photo
      FROM users
      WHERE id = ?
    `).get(otherUserId);

    if (!otherUser) {

      return res.status(404).json({
        success: false,
        message: "User not found."
      });

    }

    // Get messages between the two users
    const messages = req.db.prepare(`
      SELECT
        messages.id,
        messages.sender_id,
        messages.receiver_id,
        messages.content,
        messages.is_read,
        messages.created_at,

        sender.name AS sender_name,
        sender.profile_photo AS sender_photo,

        receiver.name AS receiver_name,
        receiver.profile_photo AS receiver_photo

      FROM messages

      JOIN users AS sender
        ON sender.id = messages.sender_id

      JOIN users AS receiver
        ON receiver.id = messages.receiver_id

      WHERE
        (
          messages.sender_id = ?
          AND messages.receiver_id = ?
        )
        OR
        (
          messages.sender_id = ?
          AND messages.receiver_id = ?
        )

      ORDER BY messages.created_at ASC,
               messages.id ASC

    `).all(
      currentUserId,
      otherUserId,
      otherUserId,
      currentUserId
    );

    // Mark received messages as read
    req.db.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE sender_id = ?
      AND receiver_id = ?
    `).run(
      otherUserId,
      currentUserId
    );

    res.json({
      success: true,
      user: otherUser,
      messages
    });

  } catch (error) {

    console.error(
      "GET CONVERSATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load conversation."
    });

  }

});

// =====================================
// SEND MESSAGE
// =====================================

router.post("/:userId", requireLogin, (req, res) => {

  try {

    const senderId =
      req.session.userId;

    const receiverId =
      Number(req.params.userId);

    const content =
      (req.body.content || "").trim();

    if (!receiverId) {

      return res.status(400).json({
        success: false,
        message: "Invalid receiver."
      });

    }

    if (receiverId === senderId) {

      return res.status(400).json({
        success: false,
        message: "You cannot message yourself."
      });

    }

    if (!content) {

      return res.status(400).json({
        success: false,
        message: "Message cannot be empty."
      });

    }

    if (content.length > 5000) {

      return res.status(400).json({
        success: false,
        message: "Message is too long."
      });

    }

    // Check receiver exists
    const receiver = req.db.prepare(`
      SELECT id
      FROM users
      WHERE id = ?
    `).get(receiverId);

    if (!receiver) {

      return res.status(404).json({
        success: false,
        message: "User not found."
      });

    }

    // Save message
    const result = req.db.prepare(`
      INSERT INTO messages (
        sender_id,
        receiver_id,
        content
      )
      VALUES (?, ?, ?)
    `).run(
      senderId,
      receiverId,
      content
    );

    res.json({
      success: true,
      message: "Message sent successfully.",
      message_id: result.lastInsertRowid
    });

  } catch (error) {

    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to send message."
    });

  }

});

module.exports = router;