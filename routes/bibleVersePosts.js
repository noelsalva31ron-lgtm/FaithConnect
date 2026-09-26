
const express = require("express");

const router = express.Router();


// =====================================
// LOGIN CHECK
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
        "Bible Verse post route is working!"

    });

  }
);


// =====================================
// CREATE BIBLE VERSE POST
// =====================================

router.post(
  "/",
  requireLogin,

  (req, res) => {

    try {

      const book =
        (req.body.book || "").trim();

      const chapter =
        (req.body.chapter || "").trim();

      const verse =
        (req.body.verse || "").trim();

      const bibleText =
        (req.body.bible_text || "").trim();

      const message =
        (req.body.message || "").trim();


      // =================================
      // VALIDATION
      // =================================

      if (!book) {

        return res.status(400).json({

          success: false,

          message:
            "Please enter the Bible book."

        });

      }


      if (!chapter) {

        return res.status(400).json({

          success: false,

          message:
            "Please enter the chapter."

        });

      }


      if (!verse) {

        return res.status(400).json({

          success: false,

          message:
            "Please enter the verse."

        });

      }


      if (!bibleText) {

        return res.status(400).json({

          success: false,

          message:
            "Please enter the Bible verse."

        });

      }


      // =================================
      // CREATE DISPLAY CONTENT
      // =================================

      const reference =
        book +
        " " +
        chapter +
        ":" +
        verse;


      let content =
        reference +
        "\n\n" +
        bibleText;


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
              bible_book,
              bible_chapter,
              bible_verse,
              bible_text
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `
          )
          .run(
            req.session.userId,
            content,
            "bible_verse",
            null,
            book,
            chapter,
            verse,
            bibleText
          );


      // =================================
      // SUCCESS
      // =================================

      res.json({

        success: true,

        message:
          "Bible Verse posted successfully.",

        post_id:
          result.lastInsertRowid,

        reference:
          reference

      });

    }

    catch (error) {

      console.error(
        "BIBLE VERSE POST ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to create Bible Verse post.",

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

