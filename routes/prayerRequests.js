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
// TEST ROUTE
// =====================================

router.get(
  "/test",
  (req, res) => {

    res.json({
      success: true,
      message:
        "Prayer Request route is working!"
    });

  }
);


// =====================================
// CREATE PRAYER REQUEST
// =====================================

router.post(
  "/",
  requireLogin,
  (req, res) => {

    try {

      const title =
        (req.body.title || "").trim();

      const request =
        (req.body.request || "").trim();

      const message =
        (req.body.message || "").trim();


      // =================================
      // VALIDATION
      // =================================

      if (!title) {

        return res.status(400).json({
          success: false,
          message:
            "Please enter a prayer request title."
        });

      }


      if (!request) {

        return res.status(400).json({
          success: false,
          message:
            "Please enter your prayer request."
        });

      }


      // =================================
      // POST CONTENT
      // =================================

      let content =
        title +
        "\n\n" +
        request;


      if (message) {

        content =
          content +
          "\n\n" +
          message;

      }


      // =================================
      // SAVE TO DATABASE
      // =================================

      const result =
        req.db
          .prepare(
            `
            INSERT INTO posts
            (
              user_id,
              content,
              post_type,
              media_url,
              prayer_title,
              prayer_request,
              prayer_message
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `
          )
          .run(
            req.session.userId,
            content,
            "prayer_request",
            null,
            title,
            request,
            message
          );


      // =================================
      // SUCCESS
      // =================================

      res.json({
        success: true,
        message:
          "Prayer Request posted successfully.",
        post_id:
          result.lastInsertRowid
      });


    } catch (error) {

      console.error(
        "PRAYER REQUEST POST ERROR:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Unable to create Prayer Request.",
        error:
          error.message
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
          .prepare(
            `
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
            `
          )
          .all(currentUserId);


      // =================================
      // SEND CURRENT USER ID
      // =================================

      res.json({
        success: true,
        current_user_id:
          currentUserId,
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
// TOGGLE I PRAYED
// =====================================

router.post(
  "/:id/pray",
  requireLogin,
  (req, res) => {

    try {

      const postId =
        Number(req.params.id);


      if (!Number.isInteger(postId)) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid prayer request ID."
        });

      }


      // =================================
      // CHECK PRAYER REQUEST
      // =================================

      const prayer =
        req.db
          .prepare(
            `
            SELECT
              id,
              user_id
            FROM posts
            WHERE id = ?
              AND post_type = 'prayer_request'
            `
          )
          .get(postId);


      if (!prayer) {

        return res.status(404).json({
          success: false,
          message:
            "Prayer Request not found."
        });

      }


      // =================================
      // CHECK EXISTING PRAYER
      // =================================

      const existingPrayer =
        req.db
          .prepare(
            `
            SELECT id
            FROM prayer_prayers
            WHERE post_id = ?
              AND user_id = ?
            `
          )
          .get(
            postId,
            req.session.userId
          );


      let prayed;


      // =================================
      // REMOVE PRAYER
      // =================================

      if (existingPrayer) {

        req.db
          .prepare(
            `
            DELETE FROM prayer_prayers
            WHERE id = ?
            `
          )
          .run(
            existingPrayer.id
          );

        prayed = false;

      }


      // =================================
      // ADD PRAYER
      // =================================

      else {

        req.db
          .prepare(
            `
            INSERT INTO prayer_prayers
            (
              post_id,
              user_id
            )
            VALUES (?, ?)
            `
          )
          .run(
            postId,
            req.session.userId
          );

        prayed = true;

      }


      // =================================
      // GET UPDATED COUNT
      // =================================

      const prayerCount =
        req.db
          .prepare(
            `
            SELECT COUNT(*) AS count
            FROM prayer_prayers
            WHERE post_id = ?
            `
          )
          .get(postId);


      // =================================
      // RESPONSE
      // =================================

      res.json({
        success: true,
        prayed,
        prayer_count:
          prayerCount.count
      });


    } catch (error) {

      console.error(
        "TOGGLE PRAYER ERROR:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Unable to update prayer."
      });

    }

  }
);


// =====================================
// MARK PRAYER REQUEST AS ANSWERED
// =====================================

router.post(
  "/:id/answered",
  requireLogin,
  (req, res) => {

    try {

      const postId =
        Number(req.params.id);


      if (!Number.isInteger(postId)) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid prayer request ID."
        });

      }


      // =================================
      // GET PRAYER REQUEST OWNER
      // =================================

      const prayer =
        req.db
          .prepare(
            `
            SELECT
              id,
              user_id,
              prayer_answered
            FROM posts
            WHERE id = ?
              AND post_type = 'prayer_request'
            `
          )
          .get(postId);


      if (!prayer) {

        return res.status(404).json({
          success: false,
          message:
            "Prayer Request not found."
        });

      }


      // =================================
      // CREATOR ONLY
      // =================================

      if (
        Number(prayer.user_id) !==
        Number(req.session.userId)
      ) {

        return res.status(403).json({
          success: false,
          message:
            "Only the Prayer Request creator can mark it as answered."
        });

      }


      // =================================
      // ALREADY ANSWERED
      // =================================

      if (prayer.prayer_answered) {

        return res.json({
          success: true,
          answered: true,
          message:
            "This Prayer Request is already marked as answered."
        });

      }


      // =================================
      // MARK AS ANSWERED
      // =================================

      req.db
        .prepare(
          `
          UPDATE posts
          SET
            prayer_answered = 1,
            prayer_answered_at =
              CURRENT_TIMESTAMP
          WHERE id = ?
          `
        )
        .run(postId);


      // =================================
      // SUCCESS
      // =================================

      res.json({
        success: true,
        answered: true,
        message:
          "Prayer Request marked as answered."
      });


    } catch (error) {

      console.error(
        "MARK PRAYER ANSWERED ERROR:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Unable to mark Prayer Request as answered."
      });

    }

  }
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;

