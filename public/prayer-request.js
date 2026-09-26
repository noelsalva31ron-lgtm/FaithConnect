document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "PRAYER REQUEST JS LOADED"
    );

    const backBtn =
      document.getElementById(
        "backBtn"
      );

    const titleInput =
      document.getElementById(
        "titleInput"
      );

    const requestInput =
      document.getElementById(
        "requestInput"
      );

    const messageInput =
      document.getElementById(
        "messageInput"
      );

    const previewTitle =
      document.getElementById(
        "previewTitle"
      );

    const previewRequest =
      document.getElementById(
        "previewRequest"
      );

    const previewMessage =
      document.getElementById(
        "previewMessage"
      );

    const postPrayerBtn =
      document.getElementById(
        "postPrayerBtn"
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
    // LIVE PREVIEW
    // =====================================

    function updatePreview() {

      const title =
        titleInput.value.trim();

      const request =
        requestInput.value.trim();

      const message =
        messageInput.value.trim();


      if (title) {

        previewTitle.textContent =
          title;

      } else {

        previewTitle.textContent =
          "Your prayer request title";

      }


      if (request) {

        previewRequest.textContent =
          request;

      } else {

        previewRequest.textContent =
          "Your prayer request will appear here.";

      }


      if (message) {

        previewMessage.textContent =
          message;

      } else {

        previewMessage.textContent =
          "";

      }

    }


    titleInput.addEventListener(
      "input",
      updatePreview
    );

    requestInput.addEventListener(
      "input",
      updatePreview
    );

    messageInput.addEventListener(
      "input",
      updatePreview
    );


    // =====================================
    // POST PRAYER REQUEST
    // =====================================

    postPrayerBtn.addEventListener(
      "click",
      async () => {

        const title =
          titleInput.value.trim();

        const request =
          requestInput.value.trim();

        const message =
          messageInput.value.trim();


        // =================================
        // VALIDATION
        // =================================

        if (!title) {

          alert(
            "Please enter a prayer request title."
          );

          titleInput.focus();

          return;

        }


        if (!request) {

          alert(
            "Please enter your prayer request."
          );

          requestInput.focus();

          return;

        }


        // =================================
        // DISABLE BUTTON
        // =================================

        postPrayerBtn.disabled =
          true;

        postPrayerBtn.textContent =
          "Posting...";

        statusMessage.textContent =
          "Saving your prayer request...";


        try {

          const response =
            await fetch(
              "/api/posts/prayer-request",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                  title:
                    title,

                  request:
                    request,

                  message:
                    message

                })

              }
            );


          const data =
            await response.json();


          // =================================
          // SERVER ERROR
          // =================================

          if (
            !response.ok ||
            !data.success
          ) {

            alert(
              data.message ||
              "Unable to post prayer request."
            );

            statusMessage.textContent =
              data.message ||
              "Unable to post prayer request.";

            return;

          }


          // =================================
          // SUCCESS
          // =================================

          statusMessage.textContent =
            "Prayer request posted successfully!";


          alert(
            "Prayer request posted successfully!"
          );


          window.location.href =
            "/";


        } catch (error) {

          console.error(
            "PRAYER REQUEST POST ERROR:",
            error
          );


          alert(
            "Unable to connect to the server."
          );


          statusMessage.textContent =
            "Unable to connect to the server.";

        } finally {

          postPrayerBtn.disabled =
            false;

          postPrayerBtn.textContent =
            "🙏 Post Prayer Request";

        }

      }
    );

  }
);

