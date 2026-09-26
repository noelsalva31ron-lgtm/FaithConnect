document.addEventListener(
  "DOMContentLoaded",
  () => {

    const photoInput =
      document.getElementById(
        "photoInput"
      );

    const choosePhotoBtn =
      document.getElementById(
        "choosePhotoBtn"
      );

    const photoPreview =
      document.getElementById(
        "photoPreview"
      );

    const captionInput =
      document.getElementById(
        "captionInput"
      );

    const postPhotoBtn =
      document.getElementById(
        "postPhotoBtn"
      );

    const statusMessage =
      document.getElementById(
        "statusMessage"
      );

    const backBtn =
      document.getElementById(
        "backBtn"
      );


    let selectedPhoto = null;


    // BACK
    backBtn.addEventListener(
      "click",
      () => {
        window.location.href = "/";
      }
    );


    // CHOOSE PHOTO
    choosePhotoBtn.addEventListener(
      "click",
      () => {
        photoInput.click();
      }
    );


    // PHOTO SELECTED
    photoInput.addEventListener(
      "change",
      () => {

        const file =
          photoInput.files[0];

        if (!file) {
          return;
        }


        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif"
        ];


        if (
          !allowedTypes.includes(
            file.type
          )
        ) {

          alert(
            "Please choose a JPG, PNG, WEBP or GIF image."
          );

          photoInput.value = "";

          return;
        }


        if (
          file.size >
          10 * 1024 * 1024
        ) {

          alert(
            "Photo must be smaller than 10 MB."
          );

          photoInput.value = "";

          return;
        }


        selectedPhoto = file;


        const imageUrl =
          URL.createObjectURL(file);


        photoPreview.innerHTML = `
          <img
            src="${imageUrl}"
            alt="Photo preview"
          >
        `;


        statusMessage.textContent =
          "Photo selected. You can now add a caption.";
      }
    );


    // POST PHOTO
    postPhotoBtn.addEventListener(
      "click",
      async () => {

        if (!selectedPhoto) {

          alert(
            "Please choose a photo first."
          );

          return;
        }


        const formData =
          new FormData();


        formData.append(
          "photo",
          selectedPhoto
        );


        formData.append(
          "caption",
          captionInput.value.trim()
        );


        postPhotoBtn.disabled = true;

        postPhotoBtn.textContent =
          "Posting...";


        statusMessage.textContent =
          "Uploading your photo...";


        try {

          const response =
            await fetch(
              "/api/posts/photo",
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
              "Unable to post photo."
            );

            return;
          }


          statusMessage.textContent =
            "Photo posted successfully!";


          alert(
            "Photo posted successfully!"
          );


          window.location.href =
            "/";

        } catch (error) {

          console.error(
            "PHOTO POST ERROR:",
            error
          );


          alert(
            "Unable to connect to the server."
          );

        } finally {

          postPhotoBtn.disabled =
            false;

          postPhotoBtn.textContent =
            "📷 Post Photo";
        }
      }
    );

  }
);