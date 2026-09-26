
// =====================================
// FAITHCONNECT V2
// AUTHENTICATION + REAL POSTS
// =====================================


// =====================================
// PAGE START
// =====================================

document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // HOME BUTTON - REFRESH PAGE
  // =====================================

  document.addEventListener(
    "click",
    (event) => {

      const homeLink =
        event.target.closest(
          ".sidebar.left nav a"
        );

      if (!homeLink) {
        return;
      }

      const text =
        homeLink.textContent.trim();

      if (!text.includes("Home")) {
        return;
      }

      event.preventDefault();

      console.log(
        "🏠 Home clicked - refreshing page"
      );

      window.location.reload();

    },
    true
  );


  setupAuthentication();
setupMobileNavigation();

  loadCurrentUser();

  setupPostSystem();


  setupProfilePhotoUpload();

  setupPhotoPostButton();

  loadPosts();

  loadUsers();

});

// =====================================
// MOBILE NAVIGATION
// =====================================

function setupMobileNavigation() {

  const mobileLinks =
    document.querySelectorAll(
      ".mobile-nav a"
    );

  if (!mobileLinks.length) {
    return;
  }

  mobileLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

      event.preventDefault();

      const section =
        link.dataset.mobileNav;

      // Update active button
      mobileLinks.forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      // HOME
      if (section === "home") {

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        return;
      }

      // BIBLE
      if (section === "bible") {

        const bibleButton =
          document.getElementById(
            "bibleVerseBtn"
          );

        if (bibleButton) {
          bibleButton.click();
          return;
        }

        window.location.href =
          "/create-bible-verse.html";

        return;
      }

      // PRAYER
      if (section === "prayer") {

        const prayerButton =
          document.getElementById(
            "prayerRequestBtn"
          );

        if (prayerButton) {
          prayerButton.click();
          return;
        }

        window.location.href =
          "/create-prayer-request.html";

        return;
      }

     // GROUPS
if (section === "groups") {

  window.location.href =
    "/groups.html";

  return;
}

      // PROFILE
      if (section === "singles") {
  window.location.href =
    "/single-christians.html";

  return;
}
    });

  });

}
// =====================================
// PHOTO POST BUTTON
// =====================================

function setupPhotoPostButton() {

  const photoPostBtn =
    document.getElementById("photoPostBtn");

  if (!photoPostBtn) {
    return;
  }

  photoPostBtn.addEventListener("click", () => {

    window.location.href =
      "/create-photo.html";

  });

}


const videoPostBtn =
  document.getElementById("videoPostBtn");

videoPostBtn.addEventListener(
  "click",
  () => {
    window.location.href = "/create-video.html";
  }
);


const bibleVerseBtn =
  document.getElementById("bibleVerseBtn");

if (bibleVerseBtn) {
  bibleVerseBtn.addEventListener(
    "click",
    () => {
      window.location.href = "/create-bible-verse.html";
    }
  );
}
const prayerRequestBtn =
  document.getElementById("prayerRequestBtn");

if (prayerRequestBtn) {
  prayerRequestBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "/create-prayer-request.html";
    }
  );
}

// =====================================
// AUTHENTICATION
// =====================================

function setupAuthentication() {

  const authButton =
    document.getElementById("authButton");

  if (!authButton) {
    return;
  }

  authButton.onclick = () => {

    if (
      authButton.classList.contains("logged-in")
    ) {

      showUserMenu();

    } else {

      showAuthModal();

    }

  };

}


// =====================================
// LOAD CURRENT USER
// =====================================

async function loadCurrentUser() {

  try {

    const response =
      await fetch("/api/auth/me");

    const data =
      await response.json();

    if (
      data.success &&
      data.user
    ) {

      setLoggedInUser(data.user);

    }

  } catch (error) {

    console.error(
      "LOAD USER ERROR:",
      error
    );

  }

}


// =====================================
// SET LOGGED-IN USER
// =====================================

function setLoggedInUser(user) {

  const authButton =
    document.getElementById("authButton");

  if (!authButton) {
    return;
  }

  authButton.classList.add("logged-in");

  authButton.dataset.userId =
    user.id;

  if (user.profile_photo) {

    authButton.innerHTML = `
      <img
        src="${escapeHtml(user.profile_photo)}"
        alt="${escapeHtml(user.name)}"
        class="top-profile-image"
      >
    `;

  } else {

    authButton.textContent =
      getInitials(user.name);

  }

}


// =====================================
// AUTH MODAL
// =====================================

function showAuthModal(defaultTab = "login") {

  const oldModal =
    document.getElementById("authModal");

  if (oldModal) {
    oldModal.remove();
  }

  const modal =
    document.createElement("div");

  modal.id = "authModal";

  modal.innerHTML = `
    <div class="auth-overlay">

      <div class="auth-box">

        <button
          class="auth-close"
          type="button"
        >
          &times;
        </button>

        <div class="auth-logo">
          ✝
        </div>

        <h2>
          Welcome to FaithConnect
        </h2>

        <p class="auth-subtitle">
          Connect, share, pray and grow together in faith.
        </p>

        <div class="auth-tabs">

          <button
            type="button"
            class="auth-tab ${defaultTab === "login" ? "active" : ""}"
            data-tab="login"
          >
            Login
          </button>

          <button
            type="button"
            class="auth-tab ${defaultTab === "register" ? "active" : ""}"
            data-tab="register"
          >
            Register
          </button>

        </div>


        <!-- =====================================
             LOGIN
        ====================================== -->

        <div
          id="loginSection"
          style="display:${defaultTab === "login" ? "block" : "none"};"
        >

          <form id="loginForm">

            <label for="loginEmail">
              Email
            </label>

            <input
              id="loginEmail"
              name="email"
              type="email"
              autocomplete="email"
              required
            >

            <label for="loginPassword">
              Password
            </label>

            <input
              id="loginPassword"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            >

            <div
              id="loginMessage"
              class="auth-message"
            ></div>

            <button
              type="submit"
              class="auth-submit"
            >
              Login
            </button>

          </form>

        </div>


        <!-- =====================================
             REGISTER
        ====================================== -->

        <div
          id="registerSection"
          style="display:${defaultTab === "register" ? "block" : "none"};"
        >

          <form id="registerForm">

            <label for="registerName">
              Full name
            </label>

            <input
              id="registerName"
              name="name"
              type="text"
              autocomplete="name"
              required
            >

            <label for="registerEmail">
              Email
            </label>

            <input
              id="registerEmail"
              name="email"
              type="email"
              autocomplete="email"
              required
            >

            <label for="registerPassword">
              Password
            </label>

            <input
              id="registerPassword"
              name="password"
              type="password"
              autocomplete="new-password"
              minlength="6"
              required
            >


            <!-- =====================================
                 BELIEF QUESTIONS
            ====================================== -->

            <div class="belief-requirements">

              <h3>
                FaithConnect Belief Requirements
              </h3>

              <p>
                Please answer each question before
                continuing.
              </p>

            </div>


            <!-- ONE QUESTION AT A TIME -->

            <div
              id="beliefStep"
              class="belief-step"
            >

              <div class="belief-progress">
                Question
                <span id="beliefQuestionNumber">1</span>
                of 5
              </div>

              <div
                id="beliefQuestionText"
                class="belief-question-text"
              >
                Do you believe in the Trinity —
                Father, Son, and Holy Spirit?
              </div>

              <div class="belief-options">

                <label>
                  <input
                    type="radio"
                    name="currentBelief"
                    value="yes"
                  >
                  Yes
                </label>

                <label>
                  <input
                    type="radio"
                    name="currentBelief"
                    value="no"
                  >
                  No
                </label>

              </div>

              <button
                type="button"
                id="beliefNextBtn"
                class="auth-submit"
              >
                Next
              </button>

            </div>


            <!-- HIDDEN ANSWERS -->

            <input
              type="hidden"
              name="beliefTrinity"
              id="beliefTrinity"
            >

            <input
              type="hidden"
              name="beliefTongues"
              id="beliefTongues"
            >

            <input
              type="hidden"
              name="beliefHeavenHell"
              id="beliefHeavenHell"
            >

            <input
              type="hidden"
              name="beliefEveryDayHoly"
              id="beliefEveryDayHoly"
            >

            <input
              type="hidden"
              name="beliefMiracles"
              id="beliefMiracles"
            >


            <div
              id="registerMessage"
              class="auth-message"
            ></div>


            <button
              type="submit"
              id="createAccountBtn"
              class="auth-submit"
              style="display:none;"
            >
              Create Account
            </button>

          </form>

        </div>

      </div>

    </div>
  `;


  // =====================================
  // ADD MODAL TO PAGE
  // =====================================

  document.body.appendChild(modal);



// =====================================
// ONE QUESTION AT A TIME
// =====================================

const beliefQuestions = [

  {
    key: "beliefTrinity",
    question:
      "Do you believe in the Trinity — Father, Son, and Holy Spirit?"
  },

  {
    key: "beliefTongues",
    question:
      "Do you believe in the Holy Spirit and speaking in tongues?"
  },

  {
    key: "beliefHeavenHell",
    question:
      "Do you believe that heaven and hell are real?"
  },

  {
    key: "beliefEveryDayHoly",
    question:
      "Do you believe that every day is holy, rather than only one specific day?"
  },

  {
    key: "beliefMiracles",
    question:
      "Do you believe that miracles are still present today?"
  }

];


let currentBeliefIndex = 0;


const beliefQuestionNumber =
  document.getElementById(
    "beliefQuestionNumber"
  );


const beliefQuestionText =
  document.getElementById(
    "beliefQuestionText"
  );


const beliefNextBtn =
  document.getElementById(
    "beliefNextBtn"
  );


const createAccountBtn =
  document.getElementById(
    "createAccountBtn"
  );


// =====================================
// HIDE MANUAL BUTTONS
// =====================================

beliefNextBtn.style.display = "none";

createAccountBtn.style.display = "none";


// =====================================
// SHOW CURRENT QUESTION
// =====================================

function showBeliefQuestion() {

  const currentQuestion =
    beliefQuestions[
      currentBeliefIndex
    ];


  beliefQuestionNumber.textContent =
    currentBeliefIndex + 1;


  beliefQuestionText.textContent =
    currentQuestion.question;


  document
    .querySelectorAll(
      'input[name="currentBelief"]'
    )
    .forEach(input => {

      input.checked = false;

    });

}


// =====================================
// HANDLE YES / NO AUTOMATICALLY
// =====================================

document
  .querySelectorAll(
    'input[name="currentBelief"]'
  )
  .forEach(input => {

    input.addEventListener(
      "change",
      () => {

        const selected =
          document.querySelector(
            'input[name="currentBelief"]:checked'
          );


        if (!selected) {
          return;
        }


        const currentQuestion =
          beliefQuestions[
            currentBeliefIndex
          ];


        // =====================================
        // SAVE ANSWER
        // =====================================

        document.getElementById(
          currentQuestion.key
        ).value =
          selected.value;


        const message =
          document.getElementById(
            "registerMessage"
          );


        // =====================================
        // NO = RETURN TO LOGIN
        // =====================================

        if (
          selected.value === "no"
        ) {

          message.className =
            "auth-message error";

          message.textContent =
            "Registration requires agreement with all five FaithConnect belief requirements.";


          setTimeout(() => {

            const loginTab =
              modal.querySelector(
                '.auth-tab[data-tab="login"]'
              );


            if (loginTab) {
              loginTab.click();
            }


            message.textContent = "";


            currentBeliefIndex = 0;


            document.getElementById(
              "beliefTrinity"
            ).value = "";

            document.getElementById(
              "beliefTongues"
            ).value = "";

            document.getElementById(
              "beliefHeavenHell"
            ).value = "";

            document.getElementById(
              "beliefEveryDayHoly"
            ).value = "";

            document.getElementById(
              "beliefMiracles"
            ).value = "";


            showBeliefQuestion();

          }, 1800);


          return;

        }


        // =====================================
        // YES = CONTINUE
        // =====================================

        message.className =
          "auth-message success";

        message.textContent =
          "Thank you.";


        currentBeliefIndex++;


        // =====================================
        // NEXT QUESTION
        // =====================================

        if (
          currentBeliefIndex <
          beliefQuestions.length
        ) {

          setTimeout(() => {

            message.textContent = "";

            showBeliefQuestion();

          }, 300);


          return;

        }


        // =====================================
        // ALL FIVE ANSWERS = YES
        // =====================================

        beliefQuestionNumber.textContent =
          "✓";


        beliefQuestionText.textContent =
          "Thank you. Your five belief requirements are complete.";


        message.className =
          "auth-message success";

        message.textContent =
          "Creating your account...";


        // =====================================
        // AUTOMATIC REGISTRATION
        // =====================================

        const registerForm =
          document.getElementById(
            "registerForm"
          );


        if (registerForm) {

          registerForm.requestSubmit();

        }

      }
    );

  });


showBeliefQuestion();




  // =====================================
  // CLOSE
  // =====================================

  modal
    .querySelector(".auth-close")
    .onclick = () => {

      modal.remove();

    };


  // =====================================
  // CLICK OUTSIDE
  // =====================================

  modal
    .querySelector(".auth-overlay")
    .onclick = (event) => {

      if (
        event.target ===
        event.currentTarget
      ) {

        modal.remove();

      }

    };


  // =====================================
  // TABS
  // =====================================

  modal
    .querySelectorAll(".auth-tab")
    .forEach(tab => {

      tab.onclick = () => {

        const selected =
          tab.dataset.tab;


        modal
          .querySelectorAll(".auth-tab")
          .forEach(button => {

            button.classList.remove(
              "active"
            );

          });


        tab.classList.add(
          "active"
        );


        modal
          .querySelector("#loginSection")
          .style.display =
            selected === "login"
              ? "block"
              : "none";


        modal
          .querySelector("#registerSection")
          .style.display =
            selected === "register"
              ? "block"
              : "none";

      };

    });


  // =====================================
  // LOGIN
  // =====================================

  modal
    .querySelector("#loginForm")
    .addEventListener(
      "submit",
      handleLogin
    );


  // =====================================
  // REGISTER
  // =====================================

  modal
    .querySelector("#registerForm")
    .addEventListener(
      "submit",
      handleRegister
    );

}
 



// =====================================
// REGISTER
// =====================================

async function handleRegister(event) {

  event.preventDefault();


  const form =
    event.target;


  const name =
    form.name.value.trim();


  const email =
    form.email.value.trim();


  const password =
    form.password.value;
  const beliefTrinity =
    form.beliefTrinity.value;

  const beliefTongues =
    form.beliefTongues.value;

  const beliefHeavenHell =
    form.beliefHeavenHell.value;

  const beliefEveryDayHoly =
    form.beliefEveryDayHoly.value;

  const beliefMiracles =
    form.beliefMiracles.value;


  const message =
    document.getElementById(
      "registerMessage"
    );


  message.className =
    "auth-message info";


  message.textContent =
    "Creating your account...";


  try {

    const response =
      await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

                    body: JSON.stringify({
            name,
            email,
            password,

            beliefTrinity,
            beliefTongues,
            beliefHeavenHell,
            beliefEveryDayHoly,
            beliefMiracles
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      message.className =
        "auth-message error";

      message.textContent =
        data.message ||
        "Registration failed.";

      return;
    }


    message.className =
      "auth-message success";


    message.textContent =
      "Account created successfully!";


    setLoggedInUser(data.user);


    setTimeout(() => {

      const modal =
        document.getElementById(
          "authModal"
        );

      if (modal) {
        modal.remove();
      }

    }, 700);


  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );


    message.className =
      "auth-message error";


    message.textContent =
      "Unable to connect to the server.";

  }

}


// =====================================
// LOGIN
// =====================================

async function handleLogin(event) {

  event.preventDefault();


  const form =
    event.target;


  const email =
    form.email.value.trim();


  const password =
    form.password.value;


  const message =
    document.getElementById(
      "loginMessage"
    );


  message.className =
    "auth-message info";


  message.textContent =
    "Logging in...";


  try {

    const response =
      await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      message.className =
        "auth-message error";


      message.textContent =
        data.message ||
        "Login failed.";


      return;

    }


    message.className =
      "auth-message success";


    message.textContent =
      "Login successful!";


      setLoggedInUser(data.user);


    setTimeout(() => {

      window.location.reload();

    }, 500);


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    message.className =
      "auth-message error";


    message.textContent =
      "Unable to connect to the server.";

  }

}


// =====================================
// LOGOUT
// =====================================

async function logoutUser() {

  try {

    const response =
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Unable to log out."
      );

      return;

    }


    const authButton =
      document.getElementById(
        "authButton"
      );


    if (authButton) {

      authButton.textContent =
        "NS";

      authButton.classList.remove(
        "logged-in"
      );

      delete authButton.dataset.userId;

    }


    const profileView =
      document.getElementById(
        "profileView"
      );


    if (profileView) {
      profileView.hidden = true;
    }


    const userMenu =
      document.getElementById(
        "userMenu"
      );


    if (userMenu) {
      userMenu.remove();
    }


    await loadPosts();

    await loadUsers();


    alert(
      "You have been logged out."
    );


  } catch (error) {

    console.error(
      "LOGOUT ERROR:",
      error
    );


    alert(
      "Unable to connect to the server."
    );

  }

}


// =====================================
// USER MENU
// =====================================

function showUserMenu() {

  const existingMenu =
    document.getElementById(
      "userMenu"
    );


  if (existingMenu) {

    existingMenu.remove();

    return;

  }


  const authButton =
    document.getElementById(
      "authButton"
    );


  if (!authButton) {
    return;
  }


  const userId =
    authButton.dataset.userId;


  if (!userId) {

    showAuthModal("login");

    return;

  }


  const menu =
    document.createElement("div");


  menu.id =
    "userMenu";


  menu.className =
    "user-menu";


  menu.innerHTML = `
    <button
      type="button"
      id="menuProfileBtn"
      class="user-menu-item"
    >
      👤 Profile
    </button>


    <button
      type="button"
      id="menuLogoutBtn"
      class="user-menu-item"
    >
      🚪 Log out
    </button>
  `;


  document.body.appendChild(menu);


  const rect =
    authButton.getBoundingClientRect();


  menu.style.position =
    "fixed";


  menu.style.top =
    `${rect.bottom + 8}px`;


  menu.style.right =
    `${window.innerWidth - rect.right}px`;


  menu.style.zIndex =
    "9999";


  // PROFILE

  document
    .getElementById(
      "menuProfileBtn"
    )
    .addEventListener(
      "click",
      () => {

        menu.remove();

        loadUserProfile(
          Number(userId)
        );

      }
    );


  // LOGOUT

  document
    .getElementById(
      "menuLogoutBtn"
    )
    .addEventListener(
      "click",
      () => {

        menu.remove();

        logoutUser();

      }
    );


  // OUTSIDE CLICK

  setTimeout(() => {

    document.addEventListener(
      "click",
      function closeUserMenu(event) {

        if (
          !menu.contains(event.target) &&
          event.target !== authButton
        ) {

          menu.remove();

          document.removeEventListener(
            "click",
            closeUserMenu
          );

        }

      }
    );

  }, 0);

}


// =====================================
// REAL POST SYSTEM
// =====================================

function setupPostSystem() {

  const input =
    document.getElementById(
      "postInput"
    );


  const postBtn =
    document.getElementById(
      "postBtn"
    );


  if (!input || !postBtn) {
    return;
  }


  postBtn.addEventListener(
    "click",
    createPost
  );


  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        createPost();

      }

    }
  );

}


// =====================================
// CREATE REAL POST
// =====================================

async function createPost() {

  const input =
    document.getElementById(
      "postInput"
    );


  const postBtn =
    document.getElementById(
      "postBtn"
    );


  const content =
    input.value.trim();


  if (!content) {

    input.focus();

    return;

  }


  postBtn.disabled = true;

  postBtn.textContent =
    "Posting...";


  try {

    const response =
      await fetch(
        "/api/posts",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            content
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Unable to create post."
      );


      if (
        response.status === 401
      ) {

        showAuthModal("login");

      }


      return;

    }


    input.value = "";


    await loadPosts();


  } catch (error) {

    console.error(
      "CREATE POST ERROR:",
      error
    );


    alert(
      "Unable to connect to the server."
    );


  } finally {

    postBtn.disabled = false;

    postBtn.textContent =
      "Post";

  }

}


// =====================================
// LOAD REAL POSTS
// =====================================

async function loadPosts() {

  const postsContainer =
    document.getElementById(
      "posts"
    );


  if (!postsContainer) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/posts"
      );


    const data =
      await response.json();


    if (!data.success) {
      return;
    }


    postsContainer.innerHTML =
      "";


    if (
      data.posts.length === 0
    ) {

      postsContainer.innerHTML = `
        <div
          class="card"
          style="padding:30px;text-align:center;color:#68747b;"
        >

          <div
            style="font-size:40px;margin-bottom:10px;"
          >
            ✝
          </div>

          <strong>
            No posts yet
          </strong>

          <p>
            Be the first to share something with the FaithConnect community.
          </p>

        </div>
      `;

      return;

    }


    data.posts.forEach(post => {

      postsContainer.appendChild(
        createPostElement(post)
      );

    });


  } catch (error) {

    console.error(
      "LOAD POSTS ERROR:",
      error
    );

  }

}


// =====================================
// CREATE POST HTML
// =====================================

function createPostElement(post) {

  const article =
    document.createElement(
      "article"
    );


  article.className =
    "post card";


  const date =
    formatPostDate(
      post.created_at
    );


  const initials =
    getInitials(
      post.name
    );


  // =====================================
  // POST CONTENT
  // =====================================

  let postContent = "";



  // =====================================
  // BIBLE VERSE POST
  // =====================================

  if (
    post.post_type === "bible_verse"
  ) {

    const bibleReference =
      post.bible_book &&
      post.bible_chapter &&
      post.bible_verse

        ? post.bible_book +
          " " +
          post.bible_chapter +
          ":" +
          post.bible_verse

        : "Bible Verse";


    postContent = `
      <div class="bible-verse-post">

        <div class="bible-verse-icon">
          📖
        </div>

      

        <div class="bible-verse-reference">
          ${escapeHtml(
            bibleReference
          )}
        </div>

        <div class="bible-verse-text">
          ${escapeHtml(
            post.bible_text ||
            ""
          )}
        </div>

        ${
          post.content &&
          post.content !==
            (
              bibleReference +
              "\n\n" +
              (post.bible_text || "")
            )
          ? `
            <div class="bible-verse-message">
              ${escapeHtml(
                post.content
                  .replace(
                    bibleReference +
                    "\n\n" +
                    (post.bible_text || ""),
                    ""
                  )
                  .trim()
              )}
            </div>
          `
          : ""
        }

      </div>
    `;



  // =====================================
  // VIDEO POST
  // =====================================

  } else if (
    post.post_type === "video" &&
    post.media_url
  ) {

    postContent = `
      ${
        post.content
          ? `
            <p class="post-text">
              ${escapeHtml(
                post.content
              )}
            </p>
          `
          : ""
      }

      <div class="video-post-player">

        <video
          src="${escapeHtml(
            post.media_url
          )}"
          controls
          playsinline
          preload="metadata"
          style="
            width: 100%;
            max-height: 600px;
            display: block;
            border-radius: 12px;
            background: #000;
          "
        ></video>

      </div>
    `;


  // =====================================
  // PHOTO POST
  // =====================================

  } else if (
    post.post_type === "photo" &&
    post.media_url
  ) {

    postContent = `
      ${
        post.content
          ? `
            <p class="post-text">
              ${escapeHtml(
                post.content
              )}
            </p>
          `
          : ""
      }

      <div class="photo-post-image">

        <img
          src="${escapeHtml(
            post.media_url
          )}"
          alt="Photo shared by ${escapeHtml(
            post.name
          )}"
          loading="lazy"
        >

      </div>
    `;


  // =====================================
  // NORMAL TEXT POST
  // =====================================

  } else {

    postContent = `
      <p class="post-text">
        ${escapeHtml(
          post.content
        )}
      </p>
    `;

  }



  // =====================================
  // COMPLETE POST
  // =====================================

  article.innerHTML = `

    <div class="post-head">

      <div class="avatar">
        ${escapeHtml(
          initials
        )}
      </div>


      <div>

        <strong>
          ${escapeHtml(
            post.name
          )}
        </strong>


        <small>
          ${escapeHtml(
            date
          )}
        </small>

      </div>


      <button
        class="more"
        type="button"
        aria-label="More options"
      >
        •••
      </button>

    </div>


    ${postContent}


    <div class="post-footer">

      <!-- AMEN -->

      <button
        class="react ${
          Number(post.user_has_amen)
            ? "liked"
            : ""
        }"
        type="button"
        data-post-id="${post.id}"
      >

        ${
          Number(post.user_has_amen)
            ? "♥"
            : "♡"
        }

        <span>
          ${post.amen_count || 0}
        </span>

        Amen

      </button>


      <!-- COMMENTS -->

      <button
        class="comment-btn"
        type="button"
        data-post-id="${post.id}"
      >

        💬

        <span>
          ${post.comment_count || 0}
        </span>

        Comments

      </button>


      <!-- SHARE -->

      <button
        class="share-btn"
        type="button"
        data-post-id="${post.id}"
      >

        ↗ Share

      </button>

    </div>


    <!-- COMMENTS AREA -->

    <div
      class="comments-section"
      id="comments-${post.id}"
      hidden
    >

      <div class="comments-list">
        <p>
          Loading comments...
        </p>
      </div>


      <form
        class="comment-form"
        data-post-id="${post.id}"
      >

        <input
          type="text"
          name="comment"
          placeholder="Write a comment..."
          maxlength="2000"
          autocomplete="off"
        >


        <button type="submit">
          Comment
        </button>

      </form>

    </div>

  `;


  return article;

}


// =====================================
// DATE FORMAT
// =====================================

function formatPostDate(
  dateString
) {

  const date =
    new Date(
      dateString.replace(
        " ",
        "T"
      ) + "Z"
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "Just now";

  }


  const now =
    new Date();


  const seconds =
    Math.floor(
      (now - date) / 1000
    );


  if (seconds < 60) {
    return "Just now";
  }


  const minutes =
    Math.floor(
      seconds / 60
    );


  if (minutes < 60) {

    return `${minutes}m ago`;

  }


  const hours =
    Math.floor(
      minutes / 60
    );


  if (hours < 24) {

    return `${hours}h ago`;

  }


  const days =
    Math.floor(
      hours / 24
    );


  if (days < 7) {

    return `${days}d ago`;

  }


  return date.toLocaleDateString();

}


// =====================================
// HELPERS
// =====================================

function getInitials(name) {

  return String(
    name || "?"
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      word =>
        word
          .charAt(0)
          .toUpperCase()
    )
    .join("");

}


function escapeHtml(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// =====================================
// AMEN
// =====================================

async function toggleAmen(
  postId,
  button
) {

  try {

    const meResponse =
      await fetch(
        "/api/auth/me"
      );


    const meData =
      await meResponse.json();


    if (
      !meResponse.ok ||
      !meData.success
    ) {

      showAuthModal("login");

      return;

    }


    if (button.disabled) {
      return;
    }


    button.disabled = true;


    const response =
      await fetch(
        `/api/posts/${postId}/amen`,
        {
          method: "POST"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Unable to update Amen."
      );

      return;

    }


    if (data.amened) {

      button.classList.add(
        "liked"
      );


      button.innerHTML =
        `♥ <span>${data.amen_count}</span> Amen`;


    } else {

      button.classList.remove(
        "liked"
      );


      button.innerHTML =
        `♡ <span>${data.amen_count}</span> Amen`;

    }


  } catch (error) {

    console.error(
      "AMEN ERROR:",
      error
    );


    alert(
      "Unable to connect to the server."
    );


  } finally {

    button.disabled = false;

  }

}


// =====================================
// LOAD COMMENTS
// =====================================

async function loadComments(
  postId,
  section
) {

  const list =
    section.querySelector(
      ".comments-list"
    );


  list.innerHTML =
    "<p>Loading comments...</p>";


  try {

    const response =
      await fetch(
        `/api/posts/${postId}/comments`
      );


    const data =
      await response.json();


    if (!response.ok) {

      list.innerHTML =
        `<p>${escapeHtml(
          data.message ||
          "Unable to load comments."
        )}</p>`;


      return;

    }


    if (
      !data.comments ||
      data.comments.length === 0
    ) {

      list.innerHTML =
        "<p>No comments yet. Be the first to comment.</p>";


      return;

    }


    list.innerHTML =
      data.comments
        .map(
          comment => `

          <div class="comment">

            <div class="comment-avatar">

              ${escapeHtml(
                getInitials(
                  comment.name
                )
              )}

            </div>


            <div class="comment-body">

              <strong>
                ${escapeHtml(
                  comment.name
                )}
              </strong>


              <small>
                ${escapeHtml(
                  formatPostDate(
                    comment.created_at
                  )
                )}
              </small>


              <p>
                ${escapeHtml(
                  comment.content
                )}
              </p>

            </div>

          </div>

        `
        )
        .join("");


  } catch (error) {

    console.error(
      "LOAD COMMENTS ERROR:",
      error
    );


    list.innerHTML =
      "<p>Unable to load comments.</p>";

  }

}


// =====================================
// POST ACTIONS
// =====================================

document.addEventListener("click", async event => {

  // =================================
  // AMEN
  // =================================

  const amenButton =
    event.target.closest(".react");

  if (amenButton) {

    const postId =
      amenButton.dataset.postId;

    if (!postId) {
      return;
    }

    await toggleAmen(
      postId,
      amenButton
    );

    return;
  }


  // =================================
  // COMMENTS
  // =================================

  const commentsButton =
    event.target.closest(".comment-btn");

  if (commentsButton) {

    const postId =
      commentsButton.dataset.postId;

    if (!postId) {
      return;
    }

    const postElement =
      commentsButton.closest(".post");

    if (!postElement) {
      return;
    }

    const commentsSection =
      postElement.querySelector(
        ".comments-section"
      );

    if (!commentsSection) {
      return;
    }

    commentsSection.hidden =
      !commentsSection.hidden;

    if (!commentsSection.hidden) {

      await loadComments(
        postId,
        commentsSection
      );

    }

    return;
  }


  // =================================
  // SHARE
  // =================================

  const shareButton =
    event.target.closest(".share-btn");

 if (shareButton) {

  const postId =
    shareButton.dataset.postId;

  console.log("REAL SHARE CLICK");
  console.log("POST ID:", postId);

  if (!postId) {
    console.log("NO POST ID");
    return;
  }

  console.log("ABOUT TO CALL sharePost");

  try {

    sharePost(postId);

    console.log("sharePost CALL FINISHED");

  } catch (error) {

    console.error(
      "sharePost ERROR:",
      error
    );

    alert(
      "Share error: " +
      error.message
    );
  }

  return;
}

});
// =====================================
// CREATE COMMENT
// =====================================

document.addEventListener(
  "submit",
  async event => {

    const form =
      event.target.closest(
        ".comment-form"
      );


    if (!form) {
      return;
    }


    event.preventDefault();


    const input =
      form.querySelector(
        "input[name='comment']"
      );


    const submitButton =
      form.querySelector(
        "button"
      );


    const postId =
      form.dataset.postId;


    const content =
      input.value.trim();


    if (!content) {

      input.focus();

      return;

    }


    try {

      const meResponse =
        await fetch(
          "/api/auth/me"
        );


      const meData =
        await meResponse.json();


      if (
        !meResponse.ok ||
        !meData.success
      ) {

        showAuthModal("login");

        return;

      }


      submitButton.disabled =
        true;


      submitButton.textContent =
        "Posting...";


      const response =
        await fetch(
          `/api/posts/${postId}/comments`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              content
            })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Unable to add comment."
        );


        return;

      }


      input.value =
        "";


      const section =
        document.getElementById(
          `comments-${postId}`
        );


      if (section) {

        section.hidden =
          false;


        await loadComments(
          postId,
          section
        );

      }


      const commentButton =
        document.querySelector(
          `.comment-btn[data-post-id="${postId}"]`
        );


      if (commentButton) {

        const count =
          commentButton.querySelector(
            "span"
          );


        if (count) {

          count.textContent =
            data.comment_count;

        }

      }


    } catch (error) {

      console.error(
        "CREATE COMMENT ERROR:",
        error
      );


      alert(
        "Unable to connect to the server."
      );


    } finally {

      submitButton.disabled =
        false;


      submitButton.textContent =
        "Comment";

    }

  }
);


// =====================================
// SHARE POST
// =====================================

function sharePost(postId) {

  console.log("sharePost FUNCTION STARTED:", postId);

  const existingMenu =
    document.querySelector(".share-menu");

  if (existingMenu) {
    existingMenu.remove();
  }

  const menu =
    document.createElement("div");

  menu.className =
    "share-menu";

  menu.innerHTML = `

    <div class="share-menu-overlay"></div>

    <div class="share-menu-box">

      <div class="share-menu-header">

        <h3>
          Share Post
        </h3>

        <button
          type="button"
          class="share-close-btn"
        >
          ×
        </button>

      </div>


      <div class="share-menu-options">

        <button
          type="button"
          class="share-option"
          data-share-action="feed"
        >

          <span class="share-option-icon">
            📢
          </span>

          <span class="share-option-text">

            <strong>
              Share to Feed
            </strong>

            <small>
              Share this post with people on FaithConnect
            </small>

          </span>

        </button>


        <button
          type="button"
          class="share-option"
          data-share-action="profile"
        >

          <span class="share-option-icon">
            👤
          </span>

          <span class="share-option-text">

            <strong>
              Share to My Profile
            </strong>

            <small>
              Post this on your profile
            </small>

          </span>

        </button>


        <button
          type="button"
          class="share-option"
          data-share-action="copy"
        >

          <span class="share-option-icon">
            🔗
          </span>

          <span class="share-option-text">

            <strong>
              Copy Link
            </strong>

            <small>
              Copy a link to this post
            </small>

          </span>

        </button>

      </div>


      <button
        type="button"
        class="share-cancel-btn"
      >
        Cancel
      </button>

    </div>
  `;


  document.body.appendChild(menu);


  // =====================================
  // CLOSE MENU
  // =====================================

  const closeMenu = () => {

    menu.remove();

  };


  menu
    .querySelector(".share-close-btn")
    .addEventListener(
      "click",
      closeMenu
    );


  menu
    .querySelector(".share-cancel-btn")
    .addEventListener(
      "click",
      closeMenu
    );


  menu
    .querySelector(".share-menu-overlay")
    .addEventListener(
      "click",
      closeMenu
    );


  // =====================================
  // SHARE TO FEED
  // =====================================

  menu
    .querySelector(
      '[data-share-action="feed"]'
    )
    .addEventListener(
      "click",
      async () => {

        try {

          const response =
            await fetch(
              `/api/posts/${postId}/share`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json"
                }
              }
            );


          const data =
            await response.json();


          if (!response.ok) {

            alert(
              data.message ||
              "Unable to share post."
            );

            return;
          }


          closeMenu();

          await loadPosts();

          alert(
            "Post shared successfully!"
          );


        } catch (error) {

          console.error(
            "SHARE ERROR:",
            error
          );

          alert(
            "Unable to connect to the server."
          );

        }

      }
    );


  // =====================================
  // SHARE TO PROFILE
  // =====================================

  menu
    .querySelector(
      '[data-share-action="profile"]'
    )
    .addEventListener(
      "click",
      async () => {

        try {

          const response =
            await fetch(
              `/api/posts/${postId}/share`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json"
                }
              }
            );


          const data =
            await response.json();


          if (!response.ok) {

            alert(
              data.message ||
              "Unable to share post."
            );

            return;
          }


          closeMenu();

          await loadPosts();

          alert(
            "Post shared to your profile!"
          );


        } catch (error) {

          console.error(
            "PROFILE SHARE ERROR:",
            error
          );

          alert(
            "Unable to connect to the server."
          );

        }

      }
    );


  // =====================================
  // COPY LINK
  // =====================================

  menu
    .querySelector(
      '[data-share-action="copy"]'
    )
    .addEventListener(
      "click",
      async () => {

        const link =
          `${window.location.origin}/#post-${postId}`;


        try {

          await navigator.clipboard.writeText(
            link
          );


          closeMenu();

          alert(
            "Post link copied!"
          );


        } catch (error) {

          console.error(
            "COPY LINK ERROR:",
            error
          );

          alert(
            "Unable to copy the link. Please copy it manually."
          );

        }

      }
    );

}
// =====================================
// USERS / FOLLOW SYSTEM
// =====================================

async function loadUsers() {

  const usersList =
    document.getElementById(
      "usersList"
    );


  if (!usersList) {
    return;
  }


  try {

    const response =
      await fetch(
        "/api/auth/users"
      );


    const data =
      await response.json();


    if (!response.ok) {

      usersList.innerHTML = `
        <p>
          ${escapeHtml(
            data.message ||
            "Please log in to see users."
          )}
        </p>
      `;


      return;

    }


    if (
      data.users.length === 0
    ) {

      usersList.innerHTML =
        "<p>No other users yet.</p>";


      return;

    }


    usersList.innerHTML =
      data.users
        .map(
          user => `

      <div
        class="user-card"
        data-user-id="${user.id}"
        role="button"
        tabindex="0"
      >

        <div class="user-avatar">
          ${escapeHtml(
            getInitials(
              user.name
            )
          )}
        </div>


        <div class="user-info">

          <strong>
            ${escapeHtml(
              user.name
            )}
          </strong>


          <small>
            ${user.followers_count}
            followers ·
            ${user.following_count}
            following
          </small>

        </div>


        <button
          class="follow-btn ${
            Number(user.is_following)
              ? "following"
              : ""
          }"
          data-user-id="${user.id}"
          type="button"
        >

          ${
            Number(user.is_following)
              ? "Following"
              : "Follow"
          }

        </button>

      </div>

    `
        )
        .join("");


  } catch (error) {

    console.error(
      "LOAD USERS ERROR:",
      error
    );


    usersList.innerHTML =
      "<p>Unable to load users.</p>";

  }

}


// =====================================
// TOGGLE FOLLOW
// =====================================

async function toggleFollow(
  userId,
  button
) {

  if (button.disabled) {
    return;
  }


  button.disabled =
    true;


  const isFollowing =
    button.classList.contains(
      "following"
    );


  try {

    const response =
      await fetch(
        `/api/auth/users/${userId}/follow`,
        {
          method:
            isFollowing
              ? "DELETE"
              : "POST"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Unable to update follow."
      );


      return;

    }


    if (data.following) {

      button.classList.add(
        "following"
      );


      button.textContent =
        "Following";


    } else {

      button.classList.remove(
        "following"
      );


      button.textContent =
        "Follow";

    }


    const userCard =
      button.closest(
        ".user-card"
      );


    if (userCard) {

      const info =
        userCard.querySelector(
          ".user-info small"
        );


      if (info) {

        info.textContent =
          `${data.followers_count} followers · ` +
          info.textContent
            .split("·")[1]
            .trim();

      }

    }


  } catch (error) {

    console.error(
      "FOLLOW ERROR:",
      error
    );


    alert(
      "Unable to connect to the server."
    );


  } finally {

    button.disabled =
      false;

  }

}


// =====================================
// FOLLOW BUTTON CLICK
// =====================================

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".follow-btn"
      );


    if (!button) {
      return;
    }


    const userId =
      button.dataset.userId;


    if (!userId) {
      return;
    }


    toggleFollow(
      userId,
      button
    );

  }
);


// =====================================
// REAL USER PROFILE
// =====================================

async function loadUserProfile(
  userId
) {

  const profileView =
    document.getElementById(
      "profileView"
    );


  if (!profileView) {
    return;
  }


  try {

    profileView.hidden =
      false;


    profileView.dataset.userId =
      userId;


    const response =
      await fetch(
        `/api/auth/users/${userId}`
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.message ||
        "Unable to load profile."
      );


      return;

    }


    const user =
      data.user;


    const stats =
      data.stats;


    document.getElementById(
      "profileName"
    ).textContent =
      user.name;


    document.getElementById(
      "profileBio"
    ).textContent =
      user.bio ||
      "No bio yet.";


    const profileAvatar =
      document.getElementById(
        "profileAvatar"
      );


    if (user.profile_photo) {

      profileAvatar.innerHTML = `
        <img
          src="${escapeHtml(
            user.profile_photo
          )}"
          alt="${escapeHtml(
            user.name
          )}"
          class="profile-avatar-image"
        >
      `;

    } else {

      profileAvatar.textContent =
        getInitials(
          user.name
        );

    }


    document.getElementById(
      "profilePostsCount"
    ).textContent =
      stats.posts_count;


    document.getElementById(
      "profileFollowersCount"
    ).textContent =
      stats.followers_count;


    document.getElementById(
      "profileFollowingCount"
    ).textContent =
      stats.following_count;


    // =================================
    // CURRENT USER
    // =================================

    const meResponse =
      await fetch(
        "/api/auth/me"
      );


    let loggedInUserId =
      null;


    if (meResponse.ok) {

      const meData =
        await meResponse.json();


      if (
        meData.success &&
        meData.user
      ) {

        loggedInUserId =
          meData.user.id;

      }

    }


    const isOwnProfile =
      Number(user.id) ===
      Number(loggedInUserId);


    // =================================
    // PROFILE PHOTO BUTTONS
    // =================================

    const choosePhotoButton =
      document.getElementById(
        "chooseProfilePhotoBtn"
      );


    const uploadPhotoButton =
      document.getElementById(
        "uploadProfilePhotoBtn"
      );


    if (choosePhotoButton) {

      choosePhotoButton.hidden =
        !isOwnProfile;

    }


    if (uploadPhotoButton) {

      uploadPhotoButton.hidden =
        true;

    }


    // =================================
    // FOLLOW BUTTON
    // =================================

    const followButton =
      document.getElementById(
        "profileFollowBtn"
      );


    if (followButton) {

      if (isOwnProfile) {

        followButton.hidden =
          true;

      } else {

        followButton.hidden =
          false;


        followButton.dataset.userId =
          user.id;


        if (
          Number(data.is_following)
        ) {

          followButton.classList.add(
            "following"
          );


          followButton.textContent =
            "Following";


        } else {

          followButton.classList.remove(
            "following"
          );


          followButton.textContent =
            "Follow";

        }

      }

    }


    // =================================
    // PROFILE POSTS
    // =================================

    const profilePosts =
      document.getElementById(
        "profilePosts"
      );


    if (
      !data.posts ||
      data.posts.length === 0
    ) {

      profilePosts.innerHTML =
        "<p>This user has not posted anything yet.</p>";


    } else {

      profilePosts.innerHTML =
        "";


      data.posts.forEach(post => {

        const postElement =
          createPostElement(
            post
          );


        profilePosts.appendChild(
          postElement
        );

      });

    }


    profileView.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  } catch (error) {

    console.error(
      "LOAD PROFILE ERROR:",
      error
    );


    alert(
      "Unable to connect to the server."
    );

  }

}


// =====================================
// CLICK USER CARD
// =====================================

document.addEventListener(
  "click",
  event => {

    const userCard =
      event.target.closest(
        ".user-card"
      );


    if (!userCard) {
      return;
    }


    // Don't open profile
    // when clicking Follow

    if (
      event.target.closest(
        ".follow-btn"
      )
    ) {

      return;

    }


    const userId =
      userCard.dataset.userId;


    if (!userId) {
      return;
    }


    loadUserProfile(
      userId
    );

  }
);


// =====================================
// PROFILE BACK BUTTON
// =====================================

document.addEventListener(
  "click",
  event => {

    const backButton =
      event.target.closest(
        "#profileBackBtn"
      );


    if (!backButton) {
      return;
    }


    const profileView =
      document.getElementById(
        "profileView"
      );


    if (profileView) {

      profileView.hidden =
        true;

    }

  }
);


// =====================================
// PROFILE PHOTO UPLOAD
// =====================================

function setupProfilePhotoUpload() {

  const input =
    document.getElementById(
      "profilePhotoInput"
    );


  const chooseButton =
    document.getElementById(
      "chooseProfilePhotoBtn"
    );


  const uploadButton =
    document.getElementById(
      "uploadProfilePhotoBtn"
    );


  if (
    !input ||
    !chooseButton ||
    !uploadButton
  ) {

    return;

  }


  // =================================
  // CHOOSE PHOTO
  // =================================

  chooseButton.addEventListener(
    "click",
    () => {

      input.click();

    }
  );


  // =================================
  // PHOTO SELECTED
  // =================================

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files[0];


      if (!file) {

        uploadButton.hidden =
          true;

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Please select an image file."
        );


        input.value =
          "";


        uploadButton.hidden =
          true;


        return;

      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        alert(
          "Image must be smaller than 5 MB."
        );


        input.value =
          "";


        uploadButton.hidden =
          true;


        return;

      }


      uploadButton.hidden =
        false;


      // =================================
      // PREVIEW
      // =================================

      const profileAvatar =
        document.getElementById(
          "profileAvatar"
        );


      if (profileAvatar) {

        const previewUrl =
          URL.createObjectURL(
            file
          );


        profileAvatar.innerHTML = `
          <img
            src="${previewUrl}"
            alt="Profile photo preview"
            class="profile-avatar-image"
          >
        `;

      }

    }
  );


  // =================================
  // UPLOAD
  // =================================

  uploadButton.addEventListener(
    "click",
    async () => {

      const file =
        input.files[0];


      if (!file) {

        alert(
          "Please choose a photo first."
        );


        return;

      }


      const formData =
        new FormData();


      formData.append(
        "profile_photo",
        file
      );


      uploadButton.disabled =
        true;


      uploadButton.textContent =
        "Uploading...";


      try {

        const response =
          await fetch(
            "/api/auth/profile-photo",
            {
              method: "POST",
              body: formData
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          alert(
            data.message ||
            "Unable to upload profile photo."
          );


          return;

        }


        alert(
          "Profile photo uploaded successfully."
        );


        uploadButton.hidden =
          true;


        uploadButton.disabled =
          false;


        uploadButton.textContent =
          "Upload Photo";


        input.value =
          "";


        // Reload logged-in user

        await loadCurrentUser();


        // Refresh current profile

        const profileView =
          document.getElementById(
            "profileView"
          );


        const profileName =
          document.getElementById(
            "profileName"
          );


        if (
          profileView &&
          !profileView.hidden &&
          profileName
        ) {

          const currentProfileId =
            profileView.dataset.userId;


          if (currentProfileId) {

            await loadUserProfile(
              currentProfileId
            );

          }

        }


        // Refresh people

        await loadUsers();


        // Refresh posts

        await loadPosts();


      } catch (error) {

        console.error(
          "PROFILE PHOTO UPLOAD ERROR:",
          error
        );


        alert(
          "Unable to connect to the server."
        );


      } finally {

        uploadButton.disabled =
          false;


        uploadButton.textContent =
          "Upload Photo";

      }

    }
  );

}

