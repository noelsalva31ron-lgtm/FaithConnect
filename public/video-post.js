document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log("VIDEO POST JS LOADED");

    const videoInput =
      document.getElementById("videoInput");

    const chooseVideoBtn =
      document.getElementById("chooseVideoBtn");

    const videoPreview =
      document.getElementById("videoPreview");

    const captionInput =
      document.getElementById("captionInput");

    const postVideoBtn =
      document.getElementById("postVideoBtn");

    const statusMessage =
      document.getElementById("statusMessage");

    const backBtn =
      document.getElementById("backBtn");


    console.log("videoInput:", videoInput);
    console.log("chooseVideoBtn:", chooseVideoBtn);
    console.log("videoPreview:", videoPreview);


    if (!videoInput) {
      console.error("ERROR: videoInput NOT FOUND");
      return;
    }

    if (!chooseVideoBtn) {
      console.error("ERROR: chooseVideoBtn NOT FOUND");
      return;
    }


    let selectedVideo = null;


    // BACK
    if (backBtn) {

      backBtn.addEventListener(
        "click",
        () => {

          window.location.href = "/";

        }
      );

    }


    // CHOOSE VIDEO
    chooseVideoBtn.addEventListener(
      "click",
      () => {

        console.log("CHOOSE VIDEO CLICKED");

        videoInput.click();

      }
    );


    // VIDEO SELECTED
    videoInput.addEventListener(
      "change",
      () => {

        console.log("VIDEO FILE SELECTED");

        const file =
          videoInput.files[0];

        if (!file) {
          return;
        }


        console.log("Selected file:", file.name);
        console.log("File type:", file.type);
        console.log("File size:", file.size);


        const allowedTypes = [
          "video/mp4",
          "video/webm",
          "video/ogg",
          "video/quicktime"
        ];


        if (
          !allowedTypes.includes(
            file.type
          )
        ) {

          alert(
            "Please choose an MP4, WEBM, OGG or MOV video."
          );

          videoInput.value = "";

          return;
        }


        // Maximum 100 MB
        if (
          file.size >
          100 * 1024 * 1024
        ) {

          alert(
            "Video must be smaller than 100 MB."
          );

          videoInput.value = "";

          return;
        }


        selectedVideo = file;


        const videoUrl =
          URL.createObjectURL(file);


        videoPreview.innerHTML = `
          <video
            src="${videoUrl}"
            controls
            playsinline
            preload="metadata"
          ></video>
        `;


        statusMessage.textContent =
          "Video selected. You can now add a caption.";

      }
    );


    // POST VIDEO
    postVideoBtn.addEventListener(
      "click",
      async () => {

        if (!selectedVideo) {

          alert(
            "Please choose a video first."
          );

          return;
        }


        const formData =
          new FormData();


        formData.append(
          "video",
          selectedVideo
        );


        formData.append(
          "caption",
          captionInput.value.trim()
        );


        postVideoBtn.disabled = true;

        postVideoBtn.textContent =
          "Posting...";


        statusMessage.textContent =
          "Uploading your video...";


        try {

          const response =
            await fetch(
              "/api/posts/video",
              {
                method: "POST",
                body: formData
              }
            );


          const data =
            await response.json();


          if (
            !response.ok ||
            !data.success
          ) {

            alert(
              data.message ||
              "Unable to post video."
            );

            return;
          }


          statusMessage.textContent =
            "Video posted successfully!";


          alert(
            "Video posted successfully!"
          );


          window.location.href = "/";


        } catch (error) {

          console.error(
            "VIDEO POST ERROR:",
            error
          );


          alert(
            "Unable to connect to the server."
          );


        } finally {

          postVideoBtn.disabled =
            false;

          postVideoBtn.textContent =
            "🎥 Post Video";

        }

      }
    );

  }
);

