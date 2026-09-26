
document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "BIBLE VERSE JS LOADED"
    );


    const backBtn =
      document.getElementById(
        "backBtn"
      );

    const bookInput =
      document.getElementById(
        "bookInput"
      );

    const chapterInput =
      document.getElementById(
        "chapterInput"
      );

    const verseInput =
      document.getElementById(
        "verseInput"
      );

    const bibleTextInput =
      document.getElementById(
        "bibleTextInput"
      );

    const messageInput =
      document.getElementById(
        "messageInput"
      );

    const previewReference =
      document.getElementById(
        "previewReference"
      );

    const previewText =
      document.getElementById(
        "previewText"
      );

    const previewMessage =
      document.getElementById(
        "previewMessage"
      );

    const postBibleVerseBtn =
      document.getElementById(
        "postBibleVerseBtn"
      );

    const statusMessage =
      document.getElementById(
        "statusMessage"
      );


    // =====================================
    // BACK BUTTON
    // =====================================

    if (backBtn) {

      backBtn.addEventListener(
        "click",
        () => {

          window.location.href = "/";

        }
      );

    }


    // =====================================
    // UPDATE PREVIEW
    // =====================================

    function updatePreview() {

      const book =
        bookInput.value.trim();

      const chapter =
        chapterInput.value.trim();

      const verse =
        verseInput.value.trim();

      const bibleText =
        bibleTextInput.value.trim();

      const message =
        messageInput.value.trim();


      // ===================================
      // REFERENCE
      // ===================================

      if (
        book &&
        chapter &&
        verse
      ) {

        previewReference.textContent =
          book +
          " " +
          chapter +
          ":" +
          verse;

      } else {

        previewReference.textContent =
          "John 3:16";

      }


      // ===================================
      // VERSE TEXT
      // ===================================

      if (bibleText) {

        previewText.textContent =
          bibleText;

      } else {

        previewText.textContent =
          "Your Bible verse will appear here.";

      }


      // ===================================
      // PERSONAL MESSAGE
      // ===================================

      if (message) {

        previewMessage.textContent =
          message;

      } else {

        previewMessage.textContent =
          "";

      }

    }


    // =====================================
    // LIVE PREVIEW EVENTS
    // =====================================

    bookInput.addEventListener(
      "input",
      updatePreview
    );

    chapterInput.addEventListener(
      "input",
      updatePreview
    );

    verseInput.addEventListener(
      "input",
      updatePreview
    );

    bibleTextInput.addEventListener(
      "input",
      updatePreview
    );

    messageInput.addEventListener(
      "input",
      updatePreview
    );


    // =====================================
    // POST BIBLE VERSE
    // =====================================

    postBibleVerseBtn.addEventListener(
      "click",
      async () => {

        const book =
          bookInput.value.trim();

        const chapter =
          chapterInput.value.trim();

        const verse =
          verseInput.value.trim();

        const bibleText =
          bibleTextInput.value.trim();

        const message =
          messageInput.value.trim();


        // =================================
        // VALIDATION
        // =================================

        if (!book) {

          alert(
            "Please enter the Bible book."
          );

          bookInput.focus();

          return;

        }


        if (!chapter) {

          alert(
            "Please enter the chapter."
          );

          chapterInput.focus();

          return;

        }


        if (!verse) {

          alert(
            "Please enter the verse number."
          );

          verseInput.focus();

          return;

        }


        if (!bibleText) {

          alert(
            "Please enter the Bible verse."
          );

          bibleTextInput.focus();

          return;

        }


        // =================================
        // DISABLE BUTTON
        // =================================

        postBibleVerseBtn.disabled =
          true;

        postBibleVerseBtn.textContent =
          "Posting...";

        statusMessage.textContent =
          "Saving your Bible Verse...";


        // =================================
        // SEND TO SERVER
        // =================================

        try {

          const response =
            await fetch(
              "/api/posts/bible-verse",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                  book:
                    book,

                  chapter:
                    chapter,

                  verse:
                    verse,

                  bible_text:
                    bibleText,

                  message:
                    message

                })

              }
            );


          // =================================
          // READ SERVER RESPONSE
          // =================================

          const data =
            await response.json();


          // =================================
          // CHECK ERROR
          // =================================

          if (
            !response.ok ||
            !data.success
          ) {

            alert(
              data.message ||
              "Unable to post Bible Verse."
            );

            statusMessage.textContent =
              data.message ||
              "Unable to post Bible Verse.";

            return;

          }


          // =================================
          // SUCCESS
          // =================================

          statusMessage.textContent =
            "Bible Verse posted successfully!";


          alert(
            "Bible Verse posted successfully!"
          );


          // =================================
          // RETURN TO HOME
          // =================================

          window.location.href =
            "/";

        }

        catch (error) {

          console.error(
            "BIBLE VERSE POST ERROR:",
            error
          );

          alert(
            "Unable to connect to the server."
          );

          statusMessage.textContent =
            "Unable to connect to the server.";

        }

        finally {

          postBibleVerseBtn.disabled =
            false;

          postBibleVerseBtn.textContent =
            "📖 Post Bible Verse";

        }

      }
    );

  }
);

