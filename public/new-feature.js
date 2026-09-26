// =====================================
// FAITHCONNECT SIDEBAR FEATURES
// BIBLE + PRAYER + GROUPS
// DO NOT MODIFY app.js
// =====================================

(function () {

  console.log("✅ Sidebar feature system loaded");

  const sidebarLinks =
    document.querySelectorAll(
      ".sidebar.left nav a"
    );

  sidebarLinks.forEach(function (link) {

    link.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        const text =
          link.innerText.trim();

        console.log(
          "Sidebar clicked:",
          text
        );

        // =====================================
// BIBLE
// =====================================

if (text.includes("Bible")) {
  openBibleGateway();
}

// =====================================
// PRAYER
// =====================================

if (text.includes("Prayer")) {
  openPrayerRequests();
}

// =====================================
// GROUPS
// =====================================

if (text.includes("Groups")) {
  openGroups();
}

// =====================================
// MESSAGES
// =====================================

if (text.includes("Messages")) {
  openMessages();
}

      }
    );

  });

})();

// =====================================
// BIBLE
// =====================================

function openBibleGateway() {

  console.log(
    "📖 Opening BibleGateway..."
  );

  const existingBible =
    document.getElementById(
      "faithconnect-bible"
    );

  if (existingBible) {

    existingBible.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return;
  }

  const bibleSection =
    document.createElement("section");

  bibleSection.id =
    "faithconnect-bible";

  bibleSection.className =
    "card";

  bibleSection.innerHTML = `

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:15px;
    ">

      <h2 style="margin:0;">
        📖 Bible
      </h2>

      <button
        id="closeBibleGateway"
        type="button"
        style="
          padding:8px 14px;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        ✕ Close
      </button>

    </div>

    <iframe
      src="https://www.biblegateway.com/"
      title="BibleGateway"
      style="
        width:100%;
        height:750px;
        border:1px solid #ddd;
        border-radius:12px;
        background:white;
      "
    ></iframe>

    <p style="
      margin-top:10px;
      font-size:13px;
      color:#777;
    ">
      If BibleGateway does not allow the page to display here,
      use the button below to open it directly.
    </p>

    <button
      id="openBibleGatewayExternal"
      type="button"
      style="
        padding:10px 16px;
        border:0;
        border-radius:8px;
        cursor:pointer;
      "
    >
      Open BibleGateway
    </button>

  `;

  const feed =
    document.querySelector(".feed");

  if (!feed) {

    console.error(
      "❌ FaithConnect feed not found."
    );

    return;
  }

  feed.appendChild(
    bibleSection
  );

  document
    .getElementById(
      "closeBibleGateway"
    )
    .addEventListener(
      "click",
      function () {

        bibleSection.remove();

      }
    );

  document
    .getElementById(
      "openBibleGatewayExternal"
    )
    .addEventListener(
      "click",
      function () {

        window.open(
          "https://www.biblegateway.com/",
          "_blank",
          "noopener,noreferrer"
        );

      }
    );

  bibleSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// =====================================
// PRAYER REQUESTS
// =====================================

async function openPrayerRequests() {

  console.log(
    "🙏 Opening Prayer Requests..."
  );

  const existingPrayer =
    document.getElementById(
      "faithconnect-prayer"
    );

  if (existingPrayer) {

    existingPrayer.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return;
  }

  const feed =
    document.querySelector(".feed");

  if (!feed) {

    console.error(
      "❌ FaithConnect feed not found."
    );

    return;
  }

  const prayerSection =
    document.createElement("section");

  prayerSection.id =
    "faithconnect-prayer";

  prayerSection.className =
    "card";

  prayerSection.innerHTML = `

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:20px;
    ">

      <h2 style="margin:0;">
        🙏 Prayer Requests
      </h2>

      <button
        id="closePrayerRequests"
        type="button"
        style="
          padding:8px 14px;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        ✕ Close
      </button>

    </div>

    <div id="prayerRequestsList">

      <p style="
        text-align:center;
        color:#777;
      ">
        Loading Prayer Requests...
      </p>

    </div>

  `;

  feed.appendChild(
    prayerSection
  );

  document
    .getElementById(
      "closePrayerRequests"
    )
    .addEventListener(
      "click",
      function () {

        prayerSection.remove();

      }
    );

  try {

    const response =
      await fetch(
        "/api/posts/prayer-request/"
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Unable to load Prayer Requests."
      );

    }

    const list =
      document.getElementById(
        "prayerRequestsList"
      );

    if (
      !data.prayers ||
      data.prayers.length === 0
    ) {

      list.innerHTML = `

        <p style="
          text-align:center;
          color:#777;
          padding:30px;
        ">
          🙏 No Prayer Requests yet.
        </p>

      `;

    } else {

      let html = "";

      data.prayers.forEach(
        function (prayer) {

          const isCreator =
            Number(prayer.user_id) ===
            Number(data.current_user_id);

          const isAnswered =
            Number(
              prayer.prayer_answered
            ) === 1;


          // =====================================
          // PROFILE IMAGE
          // =====================================

          let profileHTML = "";

          if (prayer.profile_photo) {

            profileHTML = `

              <img
                src="${prayer.profile_photo}"
                style="
                  width:42px;
                  height:42px;
                  border-radius:50%;
                  object-fit:cover;
                "
              >

            `;

          } else {

            profileHTML = `

              <div style="
                width:42px;
                height:42px;
                border-radius:50%;
                background:#eee;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:20px;
              ">
                👤
              </div>

            `;

          }


          // =====================================
          // ANSWERED STATUS
          // =====================================

          let answeredHTML = "";

          if (isAnswered) {

            answeredHTML = `

              <div style="
                display:inline-block;
                margin-bottom:12px;
                padding:7px 12px;
                border-radius:20px;
                background:#e8f7e8;
                color:#247324;
                font-weight:bold;
                font-size:14px;
              ">
                ✨ Answered Prayer
              </div>

            `;

          }


          // =====================================
          // MARK AS ANSWERED
          // =====================================

          let answerButtonHTML = "";

          if (
            isCreator &&
            !isAnswered
          ) {

            answerButtonHTML = `

              <button
                type="button"
                class="answer-prayer-button"
                data-prayer-id="${prayer.id}"
                style="
                  margin-left:auto;
                  padding:9px 14px;
                  border:0;
                  border-radius:8px;
                  cursor:pointer;
                  background:#f1f1f1;
                  font-weight:bold;
                "
              >
                ✨ Mark as Answered
              </button>

            `;

          }


          // =====================================
          // PRAY BUTTON
          // =====================================

          const prayedBackground =
            prayer.user_has_prayed
              ? "#eee"
              : "#fff";

          const prayedWeight =
            prayer.user_has_prayed
              ? "bold"
              : "normal";


          // =====================================
          // PRAYER COUNT
          // =====================================

          const prayerCount =
            Number(
              prayer.prayer_count
            );

          const prayerCountText =
            prayerCount === 1
              ? "person has prayed"
              : "people have prayed";


          // =====================================
          // PRAYER CARD
          // =====================================

          html += `

            <div
              data-prayer-id="${prayer.id}"
              style="
                border:1px solid #e5e5e5;
                border-radius:12px;
                padding:18px;
                margin-bottom:15px;
                background:#fff;
              "
            >

              <div style="
                display:flex;
                align-items:center;
                gap:10px;
                margin-bottom:12px;
              ">

                ${profileHTML}

                <strong>
                  ${prayer.name}
                </strong>

              </div>

              ${answeredHTML}

             
              <p style="
                white-space:pre-wrap;
                margin:0 0 10px 0;
              ">
                ${prayer.prayer_request}
              </p>

              ${
                prayer.prayer_message
                  ? `

                    <p style="
                      white-space:pre-wrap;
                      color:#666;
                      margin-top:10px;
                    ">
                      ${prayer.prayer_message}
                    </p>

                  `
                  : ""
              }

              <div style="
                display:flex;
                align-items:center;
                gap:10px;
                flex-wrap:wrap;
                margin-top:15px;
                padding-top:12px;
                border-top:1px solid #eee;
              ">

                <button
                  type="button"
                  class="pray-button"
                  data-prayer-id="${prayer.id}"
                  style="
                    padding:9px 14px;
                    border:1px solid #ddd;
                    border-radius:8px;
                    cursor:pointer;
                    background:${prayedBackground};
                    font-weight:${prayedWeight};
                  "
                >
                  🙏 I Prayed
                </button>

                <span
                  class="prayer-count"
                  data-prayer-id="${prayer.id}"
                  style="
                    color:#777;
                    font-size:14px;
                  "
                >
                  🙏 ${prayerCount}
                  ${prayerCountText}
                </span>

                ${answerButtonHTML}

              </div>

            </div>

          `;

        }
      );

      list.innerHTML =
        html;


      // =====================================
      // I PRAYED
      // =====================================

      document
        .querySelectorAll(
          ".pray-button"
        )
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              async function () {

                const prayerId =
                  button.dataset.prayerId;

                button.disabled = true;

                try {

                  const response =
                    await fetch(
                      `/api/posts/prayer-request/${prayerId}/pray`,
                      {
                        method:"POST"
                      }
                    );

                  const result =
                    await response.json();

                  if (
                    !response.ok ||
                    !result.success
                  ) {

                    throw new Error(
                      result.message ||
                      "Unable to update prayer."
                    );

                  }

                  const count =
                    Number(
                      result.prayer_count
                    );

                  const countElement =
                    document.querySelector(
                      `.prayer-count[data-prayer-id="${prayerId}"]`
                    );

                  if (countElement) {

                    countElement.textContent =
                      `🙏 ${count} ${
                        count === 1
                          ? "person has prayed"
                          : "people have prayed"
                      }`;

                  }

                  button.style.background =
                    result.prayed
                      ? "#eee"
                      : "#fff";

                  button.style.fontWeight =
                    result.prayed
                      ? "bold"
                      : "normal";

                } catch (error) {

                  console.error(
                    "I PRAYED ERROR:",
                    error
                  );

                  alert(
                    error.message ||
                    "Unable to update prayer."
                  );

                } finally {

                  button.disabled =
                    false;

                }

              }
            );

          }
        );


      // =====================================
      // MARK AS ANSWERED
      // =====================================

      document
        .querySelectorAll(
          ".answer-prayer-button"
        )
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              async function () {

                const prayerId =
                  button.dataset.prayerId;

                const confirmed =
                  window.confirm(
                    "Mark this Prayer Request as Answered?"
                  );

                if (!confirmed) {
                  return;
                }

                button.disabled =
                  true;

                try {

                  const response =
                    await fetch(
                      `/api/posts/prayer-request/${prayerId}/answered`,
                      {
                        method:"POST"
                      }
                    );

                  const result =
                    await response.json();

                  if (
                    !response.ok ||
                    !result.success
                  ) {

                    throw new Error(
                      result.message ||
                      "Unable to mark Prayer Request as answered."
                    );

                  }

                  const prayerCard =
                    document.querySelector(
                      `[data-prayer-id="${prayerId}"]`
                    );

                  if (prayerCard) {

                    const status =
                      document.createElement(
                        "div"
                      );

                    status.style.cssText = `
                      display:inline-block;
                      margin-bottom:12px;
                      padding:7px 12px;
                      border-radius:20px;
                      background:#e8f7e8;
                      color:#247324;
                      font-weight:bold;
                      font-size:14px;
                    `;

                    status.textContent =
                      "✨ Answered Prayer";

                    const title =
                      prayerCard.querySelector(
                        "h3"
                      );

                    if (title) {

                      prayerCard.insertBefore(
                        status,
                        title
                      );

                    }

                    button.remove();

                  }

                } catch (error) {

                  console.error(
                    "MARK ANSWERED ERROR:",
                    error
                  );

                  alert(
                    error.message ||
                    "Unable to mark Prayer Request as answered."
                  );

                  button.disabled =
                    false;

                }

              }
            );

          }
        );

    }

  } catch (error) {

    console.error(
      "PRAYER REQUEST LOAD ERROR:",
      error
    );

    const errorList =
      document.getElementById(
        "prayerRequestsList"
      );

    if (errorList) {

      errorList.innerHTML = `

        <p style="
          color:#c00;
          text-align:center;
        ">
          Unable to load Prayer Requests.
        </p>

      `;

    }

  }

  prayerSection.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}


// =====================================
// GROUPS
// =====================================

async function openGroups() {

  console.log(
    "👥 Opening Groups..."
  );

  const existingGroups =
    document.getElementById(
      "faithconnect-groups"
    );

  if (existingGroups) {

    existingGroups.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

    return;
  }

  const feed =
    document.querySelector(".feed");

  if (!feed) {

    console.error(
      "❌ FaithConnect feed not found."
    );

    return;
  }

  const groupsSection =
    document.createElement("section");

  groupsSection.id =
    "faithconnect-groups";

  groupsSection.className =
    "card";

  groupsSection.innerHTML = `

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:20px;
    ">

      <h2 style="
        margin:0;
      ">
        👥 Groups
      </h2>

      <button
        id="closeGroups"
        type="button"
        style="
          padding:8px 14px;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        ✕ Close
      </button>

    </div>


    <div style="
      text-align:center;
      padding:30px 20px;
      border:1px solid #eee;
      border-radius:12px;
      background:#fff;
    ">

      <div style="
        font-size:50px;
        margin-bottom:15px;
      ">
        👥
      </div>

      <h3 style="
        margin:0 0 10px 0;
      ">
        FaithConnect Groups
      </h3>

      <p style="
        color:#777;
        margin:0 0 20px 0;
      ">
        Connect with Christians,
        join communities, and grow together.
      </p>

      <button
        id="createGroupButton"
        type="button"
        style="
          padding:11px 18px;
          border:0;
          border-radius:8px;
          cursor:pointer;
          font-weight:bold;
        "
      >
        ➕ Create a Group
      </button>

    </div>


    <div
      id="groupsList"
      style="
        margin-top:25px;
        text-align:left;
      "
    >

      <p style="
        text-align:center;
        color:#777;
        padding:20px;
      ">
        Loading Groups...
      </p>

    </div>

  `;

  feed.appendChild(
    groupsSection
  );


  // =====================================
  // CLOSE GROUPS
  // =====================================

  document
    .getElementById("closeGroups")
    .addEventListener(
      "click",
      function () {

        groupsSection.remove();

      }
    );


  // =====================================
  // CREATE GROUP
  // =====================================

  document
    .getElementById("createGroupButton")
    .addEventListener(
      "click",
      function () {

        openCreateGroupForm();

      }
    );


  // =====================================
  // LOAD GROUPS
  // =====================================

  const groupsList =
    document.getElementById(
      "groupsList"
    );

  try {

    console.log(
      "📡 Loading groups from database..."
    );

    const response =
      await fetch(
        "/api/groups"
      );

    console.log(
      "GROUPS RESPONSE STATUS:",
      response.status
    );

    const data =
      await response.json();

    console.log(
      "GROUPS DATA:",
      data
    );

    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Unable to load groups."
      );

    }


    // =====================================
    // NO GROUPS
    // =====================================

    if (
      !data.groups ||
      data.groups.length === 0
    ) {

      groupsList.innerHTML = `

        <p style="
          text-align:center;
          color:#777;
          padding:30px;
        ">
          👥 No groups yet.
        </p>

      `;

    } else {


      // =====================================
      // DISPLAY GROUPS
      // =====================================

      let groupsHTML = "";

      data.groups.forEach(
        function (group) {

          const memberCount =
            Number(
              group.member_count || 0
            );

         groupsHTML += `

  <div
    style="
      border:1px solid #e5e5e5;
      border-radius:12px;
      padding:18px;
      margin-bottom:15px;
      background:#fff;
    "
  >

    <h3
  class="group-details-link"
  data-group-id="${group.id}"
  style="
    margin:0 0 8px 0;
    cursor:pointer;
  "
>
  👥 ${group.name}
</h3>

    <p style="
      color:#666;
      margin:0 0 15px 0;
      white-space:pre-wrap;
      line-height:1.5;
    ">
      ${
        group.description ||
        "No description provided."
      }
    </p>

    <div style="
      display:flex;
      gap:15px;
      flex-wrap:wrap;
      color:#777;
      font-size:14px;
      margin-bottom:15px;
    ">

      <span>
        👤 ${memberCount}
        ${
          memberCount === 1
            ? " member"
            : " members"
        }
      </span>

      <span>
        ✨ Created by
        ${group.creator_name}
      </span>

    </div>

    ${
      Number(group.is_member) === 1

        ? `

          <button
            type="button"
            class="leave-group-button"
            data-group-id="${group.id}"
            style="
              padding:10px 16px;
              border:1px solid #ddd;
              border-radius:8px;
              cursor:pointer;
              background:#fff;
              font-weight:bold;
            "
          >
            🚪 Leave Group
          </button>

        `

        : `

          <button
            type="button"
            class="join-group-button"
            data-group-id="${group.id}"
            style="
              padding:10px 16px;
              border:0;
              border-radius:8px;
              cursor:pointer;
              font-weight:bold;
            "
          >
            ➕ Join Group
          </button>

        `
    }

  </div>

`;

        }
      );

      groupsList.innerHTML =
        groupsHTML;
// =====================================
// OPEN GROUP DETAILS
// =====================================

document
  .querySelectorAll(".group-details-link")
  .forEach(
    function (groupTitle) {

      groupTitle.addEventListener(
        "click",
        function () {

          const groupId =
            groupTitle.dataset.groupId;

          console.log(
            "👥 Opening Group Details:",
            groupId
          );

          openGroupDetails(groupId);

        }
      );

    }
  );
      // =====================================
      // JOIN GROUP
      // =====================================

      document
        .querySelectorAll(".join-group-button")
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              async function () {

                const groupId =
                  button.dataset.groupId;

                button.disabled = true;

                button.textContent =
                  "Joining...";

                try {

                  console.log(
                    "📡 Joining group:",
                    groupId
                  );

                  const response =
                    await fetch(
                      `/api/groups/${groupId}/join`,
                      {
                        method: "POST"
                      }
                    );

                  console.log(
                    "JOIN GROUP STATUS:",
                    response.status
                  );

                  const result =
                    await response.json();

                  console.log(
                    "JOIN GROUP RESULT:",
                    result
                  );

                  if (
                    !response.ok ||
                    !result.success
                  ) {

                    throw new Error(
                      result.message ||
                      "Unable to join group."
                    );

                  }

                  // Reload Groups
                  const currentGroups =
                    document.getElementById(
                      "faithconnect-groups"
                    );

                  if (currentGroups) {
                    currentGroups.remove();
                  }

                  openGroups();

                } catch (error) {

                  console.error(
                    "❌ JOIN GROUP ERROR:",
                    error
                  );

                  alert(
                    error.message ||
                    "Unable to join group."
                  );

                  button.disabled =
                    false;

                  button.textContent =
                    "➕ Join Group";

                }

              }
            );

          }
        );


      // =====================================
      // LEAVE GROUP
      // =====================================

      document
        .querySelectorAll(".leave-group-button")
        .forEach(
          function (button) {

            button.addEventListener(
              "click",
              async function () {

                const groupId =
                  button.dataset.groupId;

                const confirmed =
                  window.confirm(
                    "Are you sure you want to leave this group?"
                  );

                if (!confirmed) {
                  return;
                }

                button.disabled = true;

                button.textContent =
                  "Leaving...";

                try {

                  console.log(
                    "📡 Leaving group:",
                    groupId
                  );

                  const response =
                    await fetch(
                      `/api/groups/${groupId}/leave`,
                      {
                        method: "POST"
                      }
                    );

                  console.log(
                    "LEAVE GROUP STATUS:",
                    response.status
                  );

                  const result =
                    await response.json();

                  console.log(
                    "LEAVE GROUP RESULT:",
                    result
                  );

                  if (
                    !response.ok ||
                    !result.success
                  ) {

                    throw new Error(
                      result.message ||
                      "Unable to leave group."
                    );

                  }

                  // Reload Groups
                  const currentGroups =
                    document.getElementById(
                      "faithconnect-groups"
                    );

                  if (currentGroups) {
                    currentGroups.remove();
                  }

                  openGroups();

                } catch (error) {

                  console.error(
                    "❌ LEAVE GROUP ERROR:",
                    error
                  );

                  alert(
                    error.message ||
                    "Unable to leave group."
                  );

                  button.disabled =
                    false;

                  button.textContent =
                    "🚪 Leave Group";

                }

              }
            );

          }
        );
    }

  } catch (error) {

    console.error(
      "❌ LOAD GROUPS ERROR:",
      error
    );

    groupsList.innerHTML = `

      <p style="
        color:#c00;
        text-align:center;
        padding:30px;
      ">
        Unable to load Groups.
      </p>

    `;

  }


  groupsSection.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}


// =====================================
// CREATE GROUP FORM
// =====================================

function openCreateGroupForm() {

  console.log(
    "➕ Opening Create Group..."
  );

  const existingForm =
    document.getElementById(
      "create-group-form"
    );

  if (existingForm) {

    existingForm.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

    return;
  }

  const formSection =
    document.createElement("section");

  formSection.id =
    "create-group-form";

  formSection.className =
    "card";

  formSection.innerHTML = `

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:20px;
    ">

      <h2 style="
        margin:0;
      ">
        ➕ Create a Group
      </h2>

      <button
        id="closeCreateGroup"
        type="button"
        style="
          padding:8px 14px;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        ✕ Close
      </button>

    </div>


    <form id="groupCreateForm">

      <label style="
        display:block;
        margin-bottom:7px;
        font-weight:bold;
      ">
        Group Name
      </label>

      <input
        id="groupName"
        type="text"
        maxlength="100"
        placeholder="Enter group name"
        required
        style="
          width:100%;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          margin-bottom:15px;
        "
      >


      <label style="
        display:block;
        margin-bottom:7px;
        font-weight:bold;
      ">
        Description
      </label>

      <textarea
        id="groupDescription"
        maxlength="500"
        placeholder="Tell people what this group is about..."
        rows="5"
        style="
          width:100%;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          resize:vertical;
          margin-bottom:15px;
        "
      ></textarea>


      <button
        type="submit"
        id="submitCreateGroup"
        style="
          padding:11px 18px;
          border:0;
          border-radius:8px;
          cursor:pointer;
          font-weight:bold;
        "
      >
        Create Group
      </button>


      <div
        id="createGroupMessage"
        style="
          margin-top:15px;
        "
      ></div>

    </form>

  `;

  const feed =
    document.querySelector(".feed");

  if (!feed) {

    console.error(
      "❌ FaithConnect feed not found."
    );

    return;
  }

  feed.appendChild(
    formSection
  );


  // =====================================
  // CLOSE CREATE GROUP
  // =====================================

  document
    .getElementById("closeCreateGroup")
    .addEventListener(
      "click",
      function () {

        formSection.remove();

        const existingGroups =
          document.getElementById(
            "faithconnect-groups"
          );

        if (existingGroups) {
          existingGroups.remove();
        }

        openGroups();

      }
    );


  // =====================================
  // CREATE GROUP SUBMIT
  // =====================================

  document
    .getElementById("groupCreateForm")
    .addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        const name =
          document
            .getElementById("groupName")
            .value
            .trim();

        const description =
          document
            .getElementById(
              "groupDescription"
            )
            .value
            .trim();

        const submitButton =
          document.getElementById(
            "submitCreateGroup"
          );

        const message =
          document.getElementById(
            "createGroupMessage"
          );


        if (!name) {

          message.style.color =
            "#c00";

          message.textContent =
            "Please enter a group name.";

          return;
        }


        submitButton.disabled =
          true;

        submitButton.textContent =
          "Creating...";

        message.textContent = "";


        try {

          console.log(
            "📡 Creating group..."
          );

          const response =
            await fetch(
              "/api/groups",
              {
                method:"POST",

                headers:{
                  "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                  name:name,
                  description:description
                })
              }
            );


          console.log(
            "CREATE GROUP STATUS:",
            response.status
          );


          const result =
            await response.json();


          console.log(
            "CREATE GROUP RESULT:",
            result
          );


          if (
            !response.ok ||
            !result.success
          ) {

            throw new Error(
              result.message ||
              "Unable to create group."
            );

          }


          // =====================================
          // SUCCESS
          // =====================================

          message.style.color =
            "#247324";

          message.style.fontWeight =
            "bold";

          message.textContent =
            "✅ Group created successfully!";

          submitButton.textContent =
            "Group Created";


          // =====================================
          // CLOSE FORM AND RELOAD GROUPS
          // =====================================

          setTimeout(
            function () {

              formSection.remove();

              const existingGroups =
                document.getElementById(
                  "faithconnect-groups"
                );

              if (existingGroups) {
                existingGroups.remove();
              }

              openGroups();

            },
            800
          );


        } catch (error) {

          console.error(
            "❌ CREATE GROUP ERROR:",
            error
          );

          message.style.color =
            "#c00";

          message.textContent =
            error.message ||
            "Unable to create group.";

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Create Group";

        }

      }
    );


  formSection.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}
// =====================================
// GROUP DETAILS
// =====================================

async function openGroupDetails(groupId) {

  console.log(
    "📡 Loading Group Details:",
    groupId
  );

  const existingDetails =
    document.getElementById(
      "faithconnect-group-details"
    );

  if (existingDetails) {
    existingDetails.remove();
  }

  const feed =
    document.querySelector(".feed");

  if (!feed) {

    console.error(
      "❌ FaithConnect feed not found."
    );

    return;
  }

  const detailsSection =
    document.createElement("section");

  detailsSection.id =
    "faithconnect-group-details";

  detailsSection.className =
    "card";

  detailsSection.innerHTML = `

    <div style="
      text-align:center;
      padding:30px;
    ">

      <div style="
        font-size:45px;
      ">
        👥
      </div>

      <p>
        Loading Group...
      </p>

    </div>

  `;

  feed.appendChild(
    detailsSection
  );

  detailsSection.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });


  try {

    const response =
      await fetch(
        `/api/groups/${groupId}`
      );

    const data =
      await response.json();

    console.log(
      "GROUP DETAILS DATA:",
      data
    );

    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Unable to load group."
      );

    }

    const group =
      data.group;

    const members =
      data.members || [];

    const currentUser =
      data.current_user;
    // =====================================
    // LOAD GROUP POSTS
    // =====================================

    let groupPosts = [];

    try {

      const postsResponse =
        await fetch(
          `/api/group-posts/${groupId}`
        );

      const postsData =
        await postsResponse.json();

      if (
        postsResponse.ok &&
        postsData.success
      ) {

        groupPosts =
          postsData.posts || [];

      }

    } catch (error) {

      console.error(
        "❌ LOAD GROUP POSTS ERROR:",
        error
      );

    }

    // =====================================
    // MEMBER LIST
    // =====================================

    let membersHTML = "";

    if (members.length === 0) {

      membersHTML = `
        <p style="
          color:#777;
        ">
          No members yet.
        </p>
      `;

    } else {

      members.forEach(
        function (member) {

          const photo =
            member.profile_photo
              ? `
                <img
                  src="${member.profile_photo}"
                  style="
                    width:42px;
                    height:42px;
                    border-radius:50%;
                    object-fit:cover;
                  "
                >
              `
              : `
                <div style="
                  width:42px;
                  height:42px;
                  border-radius:50%;
                  background:#eee;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                ">
                  👤
                </div>
              `;

          const role =
            member.role === "owner"
              ? "⭐ Owner"
              : "Member";

          membersHTML += `

            <div style="
              display:flex;
              align-items:center;
              gap:10px;
              padding:10px 0;
              border-bottom:1px solid #eee;
            ">

              ${photo}

              <div>

                <strong>
                  ${member.name}
                </strong>

                <div style="
                  font-size:13px;
                  color:#777;
                ">
                  ${role}
                </div>

              </div>

            </div>

          `;

        }
      );

    }

    // =====================================
    // GROUP POSTS HTML
    // =====================================

    let groupPostsHTML = "";

    if (groupPosts.length === 0) {

      groupPostsHTML = `
        <p style="
          text-align:center;
          color:#777;
          padding:20px;
        ">
          📝 No posts in this group yet.
        </p>
      `;

    } else {

      groupPosts.forEach(
        function (post) {

          const photo =
            post.profile_photo
              ? `
                <img
                  src="${post.profile_photo}"
                  style="
                    width:42px;
                    height:42px;
                    border-radius:50%;
                    object-fit:cover;
                  "
                >
              `
              : `
                <div style="
                  width:42px;
                  height:42px;
                  border-radius:50%;
                  background:#eee;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                ">
                  👤
                </div>
              `;

          groupPostsHTML += `

            <div style="
              border:1px solid #eee;
              border-radius:12px;
              padding:15px;
              margin-bottom:15px;
              background:#fff;
            ">

              <div style="
                display:flex;
                align-items:center;
                gap:10px;
                margin-bottom:12px;
              ">

                ${photo}

                <div>

                  <strong>
                    ${post.user_name}
                  </strong>

                  <div style="
                    font-size:12px;
                    color:#888;
                  ">
                    ${post.created_at}
                  </div>

                </div>

              </div>

              <div style="
                white-space:pre-wrap;
                line-height:1.6;
                color:#444;
              ">
                ${post.content}
              </div>

            </div>

          `;

        }
      );

    }
    // =====================================
    // JOIN / LEAVE BUTTON
    // =====================================

    let membershipButton = "";

    if (currentUser.is_member) {

      if (
        currentUser.role === "owner"
      ) {

        membershipButton = `

          <div style="
            display:inline-block;
            padding:10px 16px;
            border-radius:8px;
            background:#f1f1f1;
            font-weight:bold;
          ">
            ⭐ Group Owner
          </div>

        `;

      } else {

        membershipButton = `

          <button
            type="button"
            id="detailsLeaveGroup"
            style="
              padding:10px 16px;
              border:1px solid #ddd;
              border-radius:8px;
              cursor:pointer;
              background:#fff;
              font-weight:bold;
            "
          >
            🚪 Leave Group
          </button>

        `;

      }

    } else {

      membershipButton = `

        <button
          type="button"
          id="detailsJoinGroup"
          style="
            padding:10px 16px;
            border:0;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;
          "
        >
          ➕ Join Group
        </button>

      `;

    }


    detailsSection.innerHTML = `

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:20px;
      ">

        <h2 style="
          margin:0;
        ">
          👥 ${group.name}
        </h2>

        <button
          type="button"
          id="closeGroupDetails"
          style="
            padding:8px 14px;
            border:0;
            border-radius:8px;
            cursor:pointer;
          "
        >
          ✕ Close
        </button>

      </div>


      <div style="
        border:1px solid #eee;
        border-radius:12px;
        padding:20px;
        background:#fff;
      ">

        <p style="
          white-space:pre-wrap;
          line-height:1.6;
          color:#555;
        ">
          ${
            group.description ||
            "No description provided."
          }
        </p>

        <div style="
          color:#777;
          font-size:14px;
          margin-bottom:20px;
        ">
          👤 ${members.length}
          ${
            members.length === 1
              ? " member"
              : " members"
          }

          <br>

          ✨ Created by
          ${group.creator_name}
        </div>

        ${membershipButton}

      </div>


      <div style="
        margin-top:25px;
        border:1px solid #eee;
        border-radius:12px;
        padding:20px;
        background:#fff;
      ">

        <h3 style="
          margin-top:0;
        ">
          👥 Members
        </h3>
        ${membersHTML}

      </div>


      <!-- =====================================
           GROUP POSTS
      ====================================== -->

      <div style="
        margin-top:25px;
        border:1px solid #eee;
        border-radius:12px;
        padding:20px;
        background:#fff;
      ">

        <h3 style="
          margin-top:0;
          margin-bottom:15px;
        ">
          📝 Group Posts
        </h3>

        ${
          currentUser.is_member
            ? `
              <div style="
                margin-bottom:20px;
                padding:15px;
                border:1px solid #eee;
                border-radius:10px;
                background:#fafafa;
              ">

                <textarea
                  id="groupPostContent"
                  placeholder="Write something in this group..."
                  style="
                    width:100%;
                    min-height:90px;
                    resize:vertical;
                    box-sizing:border-box;
                    padding:12px;
                    border:1px solid #ddd;
                    border-radius:8px;
                    font-family:inherit;
                    margin-bottom:10px;
                  "
                ></textarea>

                <button
                  type="button"
                  id="createGroupPostButton"
                  style="
                    padding:10px 18px;
                    border:0;
                    border-radius:8px;
                    cursor:pointer;
                    font-weight:bold;
                  "
                >
                  📝 Post in Group
                </button>

              </div>
            `
            : `
              <div style="
                padding:15px;
                margin-bottom:20px;
                border-radius:10px;
                background:#f5f5f5;
                color:#777;
                text-align:center;
              ">
                🔒 Join this group to create a post.
              </div>
            `
        }

        <div id="groupPostsList">

          ${groupPostsHTML}

        </div>

      </div>

    `;
    // =====================================
    // CREATE GROUP POST
    // =====================================

    const createGroupPostButton =
      document.getElementById(
        "createGroupPostButton"
      );

    if (createGroupPostButton) {

      createGroupPostButton.addEventListener(
        "click",
        async function () {

          const textarea =
            document.getElementById(
              "groupPostContent"
            );

          const content =
            textarea.value.trim();

          if (!content) {

            alert(
              "Please write something first."
            );

            textarea.focus();

            return;
          }

          createGroupPostButton.disabled =
            true;

          createGroupPostButton.textContent =
            "Posting...";

          try {

            const response =
              await fetch(
                `/api/group-posts/${groupId}`,
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json"
                  },

                  body: JSON.stringify({
                    content: content
                  })
                }
              );

            const result =
              await response.json();

            if (
              !response.ok ||
              !result.success
            ) {

              throw new Error(
                result.message ||
                "Unable to create group post."
              );

            }

            console.log(
              "✅ GROUP POST CREATED:",
              result
            );

            // Reload Group Details
            openGroupDetails(
              groupId
            );

          } catch (error) {

            console.error(
              "❌ CREATE GROUP POST ERROR:",
              error
            );

            alert(
              error.message ||
              "Unable to create group post."
            );

            createGroupPostButton.disabled =
              false;

            createGroupPostButton.textContent =
              "📝 Post in Group";

          }

        }
      );

    }
    // =====================================
    // CLOSE
    // =====================================

    document
      .getElementById(
        "closeGroupDetails"
      )
      .addEventListener(
        "click",
        function () {

          detailsSection.remove();

        }
      );


    // =====================================
    // JOIN
    // =====================================

    const joinButton =
      document.getElementById(
        "detailsJoinGroup"
      );

    if (joinButton) {

      joinButton.addEventListener(
        "click",
        async function () {

          joinButton.disabled = true;

          joinButton.textContent =
            "Joining...";

          try {

            const response =
              await fetch(
                `/api/groups/${groupId}/join`,
                {
                  method:"POST"
                }
              );

            const result =
              await response.json();

            if (
              !response.ok ||
              !result.success
            ) {

              throw new Error(
                result.message ||
                "Unable to join group."
              );

            }

            openGroupDetails(
              groupId
            );

          } catch (error) {

            console.error(
              "JOIN DETAILS ERROR:",
              error
            );

            alert(
              error.message
            );

            joinButton.disabled =
              false;

            joinButton.textContent =
              "➕ Join Group";

          }

        }
      );

    }


    // =====================================
    // LEAVE
    // =====================================

    const leaveButton =
      document.getElementById(
        "detailsLeaveGroup"
      );

    if (leaveButton) {

      leaveButton.addEventListener(
        "click",
        async function () {

          const confirmed =
            window.confirm(
              "Are you sure you want to leave this group?"
            );

          if (!confirmed) {
            return;
          }

          leaveButton.disabled =
            true;

          leaveButton.textContent =
            "Leaving...";

          try {

            const response =
              await fetch(
                `/api/groups/${groupId}/leave`,
                {
                  method:"POST"
                }
              );

            const result =
              await response.json();

            if (
              !response.ok ||
              !result.success
            ) {

              throw new Error(
                result.message ||
                "Unable to leave group."
              );

            }

            openGroupDetails(
              groupId
            );

          } catch (error) {

            console.error(
              "LEAVE DETAILS ERROR:",
              error
            );

            alert(
              error.message
            );

            leaveButton.disabled =
              false;

            leaveButton.textContent =
              "🚪 Leave Group";

          }

        }
      );

    }

  } catch (error) {

    console.error(
      "❌ GROUP DETAILS ERROR:",
      error
    );

    detailsSection.innerHTML = `

      <p style="
        color:#c00;
        text-align:center;
        padding:30px;
      ">
        Unable to load Group Details.
      </p>

    `;

  }

}
// =====================================
// CHURCHES SIDEBAR
// =====================================

document.addEventListener("click", function(event) {

  const churchesButton =
    event.target.closest(
      '[data-section="churches"]'
    );

  if (!churchesButton) {
    return;
  }

  console.log("⛪ Churches clicked");

  openChurches();

});

// =====================================
// CHURCHES
// =====================================

async function openChurches() {

  console.log("⛪ Opening Churches...");

  const existingChurches =
    document.getElementById(
      "faithconnect-churches"
    );

  if (existingChurches) {

    existingChurches.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return;
  }

  const feed =
    document.querySelector(".feed");

  if (!feed) {

    console.error(
      "❌ FaithConnect feed not found."
    );

    return;
  }

  const churchesSection =
    document.createElement("section");

  churchesSection.id =
    "faithconnect-churches";

  churchesSection.className =
    "card";

  churchesSection.innerHTML = `

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:20px;
    ">

      <h2 style="
        margin:0;
      ">
        ⛪ Churches
      </h2>

      <button
        type="button"
        id="closeChurches"
        style="
          padding:8px 14px;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        ✕ Close
      </button>

    </div>

    <div style="
      text-align:center;
      padding:40px 20px;
      border:1px solid #eee;
      border-radius:12px;
      background:#fff;
    ">

      <div style="
        font-size:55px;
        margin-bottom:15px;
      ">
        ⛪
      </div>

      <h3 style="
        margin:0 0 10px 0;
      ">
        FaithConnect Churches
      </h3>

      <p style="
        color:#777;
        margin:0;
        line-height:1.6;
      ">
        Find churches, connect with Christian
        communities, and grow together in faith.
      </p>
<button
  type="button"
  id="createChurchButton"
  style="
    margin-top:20px;
    padding:11px 18px;
    border:0;
    border-radius:8px;
    cursor:pointer;
    font-weight:bold;
  "
>
  ➕ Create a Church
</button>
     <div
  id="churchesList"
  style="
    margin-top:25px;
    text-align:left;
  "
>

  <p style="
    text-align:center;
    color:#777;
    padding:20px;
  ">
    Loading Churches...
  </p>

</div>

    </div>

  `;

  feed.appendChild(
    churchesSection
  );

  // =====================================
  // CLOSE CHURCHES
  // =====================================

  document
    .getElementById("closeChurches")
    .addEventListener(
      "click",
      function () {

        churchesSection.remove();

      }
    );
// =====================================
// CREATE CHURCH BUTTON
// =====================================

document
  .getElementById("createChurchButton")
  .addEventListener(
    "click",
    function () {

      openCreateChurchForm();

    }
  );
// =====================================
// LOAD CHURCHES
// =====================================

const churchesList =
  document.getElementById(
    "churchesList"
  );

try {

  console.log(
    "📡 Loading churches from database..."
  );

  const response =
    await fetch(
      "/api/churches"
    );

  console.log(
    "CHURCHES RESPONSE STATUS:",
    response.status
  );

  const data =
    await response.json();

  console.log(
    "CHURCHES DATA:",
    data
  );

  if (
    !response.ok ||
    !data.success
  ) {

    throw new Error(
      data.message ||
      "Unable to load churches."
    );

  }

  if (
    !data.churches ||
    data.churches.length === 0
  ) {

    churchesList.innerHTML = `

      <p style="
        text-align:center;
        color:#777;
        padding:30px;
      ">
        ⛪ No churches yet.
      </p>

    `;

  } else {

    let churchesHTML = "";

data.churches.forEach(
  function (church) {

    const memberCount =
      Number(
        church.member_count || 0
      );

    const isMember =
      Number(church.is_member || 0) === 1;

    let churchButton = "";

    if (isMember) {

      churchButton = `
        <button
          class="church-leave-btn"
          data-church-id="${church.id}"
          style="
            margin-top:15px;
            padding:10px 18px;
            border:none;
            border-radius:8px;
            background:#777;
            color:white;
            cursor:pointer;
            font-weight:600;
          "
        >
          Leave Church
        </button>
      `;

    } else {

      churchButton = `
        <button
          class="church-join-btn"
          data-church-id="${church.id}"
          style="
            margin-top:15px;
            padding:10px 18px;
            border:none;
            border-radius:8px;
            background:#315d52;
            color:white;
            cursor:pointer;
            font-weight:600;
          "
        >
          Join Church
        </button>
      `;

    }

    // Owner does not get a Leave button
    if (
      isMember &&
      church.created_by === window.currentUserId
    ) {

      churchButton = `
        <div style="
          margin-top:15px;
          color:#b58a35;
          font-weight:600;
        ">
          👑 Church Owner
        </div>
      `;

    }

    churchesHTML += `

      <div style="
        border:1px solid #e5e5e5;
        border-radius:12px;
        padding:18px;
        margin-bottom:15px;
        background:#fff;
      ">

        <h3 style="
          margin:0 0 10px 0;
        ">
          ⛪ ${church.name}
        </h3>

        <p style="
          color:#666;
          margin:0 0 15px 0;
          white-space:pre-wrap;
          line-height:1.5;
        ">
          ${
            church.description ||
            "No description provided."
          }
        </p>

        <div style="
          color:#777;
          font-size:14px;
          line-height:1.8;
        ">

          ${
            church.address
              ? `📍 ${church.address}<br>`
              : ""
          }

          ${
            church.city
              ? `🏙️ ${church.city}<br>`
              : ""
          }

          ${
            church.country
              ? `🌍 ${church.country}<br>`
              : ""
          }

          👤 ${memberCount}
          ${
            memberCount === 1
              ? " member"
              : " members"
          }

          <br>

          ✨ Created by
          ${church.creator_name}

        </div>

        ${churchButton}

        <button
          class="church-details-btn"
          data-church-id="${church.id}"
          style="
            margin-top:10px;
            margin-left:8px;
            padding:10px 18px;
            border:none;
            border-radius:8px;
            background:#b58a35;
            color:white;
            cursor:pointer;
            font-weight:600;
          "
        >
          View Church
        </button>

      </div>

    `;

  }
);

churchesList.innerHTML =
  churchesHTML;

  }

} catch (error) {

  console.error(
    "❌ LOAD CHURCHES ERROR:",
    error
  );

  if (churchesList) {

    churchesList.innerHTML = `

      <p style="
        color:#c00;
        text-align:center;
        padding:30px;
      ">
        Unable to load Churches.
      </p>

    `;

  }

}
  churchesSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}
// =====================================
// CREATE CHURCH FORM
// =====================================

function openCreateChurchForm() {

  console.log(
    "➕ Opening Create Church..."
  );

  const existingForm =
    document.getElementById(
      "create-church-form"
    );

  if (existingForm) {

    existingForm.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

    return;
  }

  const formSection =
    document.createElement("section");

  formSection.id =
    "create-church-form";

  formSection.className =
    "card";

  formSection.innerHTML = `

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:20px;
    ">

      <h2 style="
        margin:0;
      ">
        ➕ Create a Church
      </h2>

      <button
        type="button"
        id="closeCreateChurch"
        style="
          padding:8px 14px;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        ✕ Close
      </button>

    </div>

    <form id="churchCreateForm">

      <label style="
        display:block;
        margin-bottom:7px;
        font-weight:bold;
      ">
        Church Name
      </label>

      <input
        id="churchName"
        type="text"
        maxlength="150"
        placeholder="Enter church name"
        required
        style="
          width:100%;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          margin-bottom:15px;
        "
      >

      <label style="
        display:block;
        margin-bottom:7px;
        font-weight:bold;
      ">
        Description
      </label>

      <textarea
        id="churchDescription"
        maxlength="1000"
        placeholder="Tell people about this church..."
        rows="5"
        style="
          width:100%;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          resize:vertical;
          margin-bottom:15px;
        "
      ></textarea>

      <label style="
        display:block;
        margin-bottom:7px;
        font-weight:bold;
      ">
        Address
      </label>

      <input
        id="churchAddress"
        type="text"
        maxlength="250"
        placeholder="Church address"
        style="
          width:100%;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          margin-bottom:15px;
        "
      >

      <label style="
        display:block;
        margin-bottom:7px;
        font-weight:bold;
      ">
        City
      </label>

      <input
        id="churchCity"
        type="text"
        maxlength="100"
        placeholder="City"
        style="
          width:100%;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          margin-bottom:15px;
        "
      >

      <label style="
        display:block;
        margin-bottom:7px;
        font-weight:bold;
      ">
        Country
      </label>

      <input
        id="churchCountry"
        type="text"
        maxlength="100"
        placeholder="Country"
        style="
          width:100%;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:8px;
          margin-bottom:15px;
        "
      >

      <button
        type="submit"
        id="submitCreateChurch"
        style="
          padding:11px 18px;
          border:0;
          border-radius:8px;
          cursor:pointer;
          font-weight:bold;
        "
      >
        Create Church
      </button>

      <div
        id="createChurchMessage"
        style="
          margin-top:15px;
        "
      ></div>

    </form>

  `;

  const feed =
    document.querySelector(".feed");

  if (!feed) {

    console.error(
      "❌ FaithConnect feed not found."
    );

    return;
  }

  feed.appendChild(
    formSection
  );

  // =====================================
  // CLOSE FORM
  // =====================================

  document
    .getElementById("closeCreateChurch")
    .addEventListener(
      "click",
      function () {

        formSection.remove();

      }
    );

  // =====================================
  // SUBMIT FORM
  // =====================================

  document
    .getElementById("churchCreateForm")
    .addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        const name =
          document
            .getElementById("churchName")
            .value
            .trim();

        const description =
          document
            .getElementById("churchDescription")
            .value
            .trim();

        const address =
          document
            .getElementById("churchAddress")
            .value
            .trim();

        const city =
          document
            .getElementById("churchCity")
            .value
            .trim();

        const country =
          document
            .getElementById("churchCountry")
            .value
            .trim();

        const submitButton =
          document.getElementById(
            "submitCreateChurch"
          );

        const message =
          document.getElementById(
            "createChurchMessage"
          );

        if (!name) {

          message.style.color =
            "#c00";

          message.textContent =
            "Please enter a church name.";

          return;
        }

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Creating...";

        message.textContent = "";

        try {

          console.log(
            "📡 Creating church..."
          );

          const response =
            await fetch(
              "/api/churches",
              {
                method:"POST",

                headers:{
                  "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                  name:name,
                  description:description,
                  address:address,
                  city:city,
                  country:country
                })
              }
            );

          console.log(
            "CREATE CHURCH STATUS:",
            response.status
          );

          const result =
            await response.json();

          console.log(
            "CREATE CHURCH RESULT:",
            result
          );

          if (
            !response.ok ||
            !result.success
          ) {

            throw new Error(
              result.message ||
              "Unable to create church."
            );

          }

          message.style.color =
            "#247324";

          message.style.fontWeight =
            "bold";

          message.textContent =
            "✅ Church created successfully!";

          submitButton.textContent =
            "Church Created";

          setTimeout(
            function () {

              formSection.remove();

              const existingChurches =
                document.getElementById(
                  "faithconnect-churches"
                );

              if (existingChurches) {
                existingChurches.remove();
              }

              openChurches();

            },
            800
          );

        } catch (error) {

          console.error(
            "❌ CREATE CHURCH ERROR:",
            error
          );

          message.style.color =
            "#c00";

          message.textContent =
            error.message ||
            "Unable to create church.";

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Create Church";

        }

      }
    );

  formSection.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}
// =====================================
// CHURCH JOIN / LEAVE BUTTONS
// =====================================

document.addEventListener("click", async function (event) {

  const joinButton =
    event.target.closest(".church-join-btn");

  const leaveButton =
    event.target.closest(".church-leave-btn");

  if (!joinButton && !leaveButton) {
    return;
  }

  const button =
    joinButton || leaveButton;

  const churchId =
    button.dataset.churchId;

  if (!churchId) {
    return;
  }

  const isLeaving =
    button.classList.contains("church-leave-btn");

  const url = isLeaving
    ? `/api/churches/${churchId}/leave`
    : `/api/churches/${churchId}/join`;

  button.disabled = true;

  button.textContent =
    isLeaving
      ? "Leaving..."
      : "Joining...";

  try {

    const response =
      await fetch(url, {
        method: "POST"
      });

    const data =
      await response.json();

    if (!response.ok || !data.success) {

      alert(
        data.message ||
        "Unable to update church membership."
      );

      button.disabled = false;

      button.textContent =
        isLeaving
          ? "Leave Church"
          : "Join Church";

      return;
    }

    alert(
      data.message ||
      "Church membership updated."
    );

    // Reload Churches
    const churchesSection =
      document.getElementById(
        "faithconnect-churches"
      );

    if (churchesSection) {
      churchesSection.remove();
    }

    openChurches();

  } catch (error) {

    console.error(
      "❌ CHURCH MEMBERSHIP ERROR:",
      error
    );

    alert(
      "Unable to connect to the server."
    );

    button.disabled = false;

    button.textContent =
      isLeaving
        ? "Leave Church"
        : "Join Church";
  }

});
// =====================================
// VIEW CHURCH DETAILS
// =====================================

document.addEventListener("click", function (event) {

  const detailsButton =
    event.target.closest(".church-details-btn");

  if (!detailsButton) {
    return;
  }

  const churchId =
    detailsButton.dataset.churchId;

  if (!churchId) {
    return;
  }

  console.log(
    "⛪ Church Details clicked:",
    churchId
  );

  openChurchDetails(churchId);

});
// =====================================
// OPEN CHURCH DETAILS
// =====================================

async function openChurchDetails(churchId) {

  console.log(
    "⛪ Opening Church Details:",
    churchId
  );

  // Remove existing church details
  const existingDetails =
    document.getElementById(
      "faithconnect-church-details"
    );

  if (existingDetails) {
    existingDetails.remove();
  }

  // Create details section
  const detailsSection =
    document.createElement("section");

  detailsSection.id =
    "faithconnect-church-details";

  detailsSection.className =
    "card";

  detailsSection.innerHTML = `

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:20px;
    ">

      <h2 style="
        margin:0;
      ">
        ⛪ Church Details
      </h2>

      <button
        id="closeChurchDetails"
        style="
          border:none;
          background:#eee;
          padding:8px 14px;
          border-radius:8px;
          cursor:pointer;
        "
      >
        ✕ Close
      </button>

    </div>

    <div id="churchDetailsContent">

      <p style="
        text-align:center;
        color:#777;
        padding:30px;
      ">
        Loading church details...
      </p>

    </div>

  `;

  const feed =
    document.querySelector(".feed");

  if (!feed) {
    console.error(
      "❌ Feed container not found."
    );
    return;
  }

  feed.appendChild(detailsSection);

  // Close button
  document
    .getElementById("closeChurchDetails")
    .addEventListener("click", function () {

      detailsSection.remove();

    });

  const content =
    document.getElementById(
      "churchDetailsContent"
    );

  try {

    const response =
      await fetch(
        `/api/churches/${churchId}`
      );

    const data =
      await response.json();

    if (!response.ok || !data.success) {

      throw new Error(
        data.message ||
        "Unable to load church details."
      );

    }

    const church =
      data.church;

    const memberCount =
      Number(
        church.member_count || 0
      );

    content.innerHTML = `

      <div style="
        border:1px solid #e5e5e5;
        border-radius:12px;
        padding:20px;
        background:#fff;
      ">

        <h2 style="
          margin:0 0 12px 0;
        ">
          ⛪ ${church.name}
        </h2>

        <p style="
          color:#666;
          line-height:1.6;
          white-space:pre-wrap;
        ">
          ${
            church.description ||
            "No description provided."
          }
        </p>

        <div style="
          color:#777;
          line-height:2;
          margin-top:15px;
        ">

          ${
            church.address
              ? `📍 ${church.address}<br>`
              : ""
          }

          ${
            church.city
              ? `🏙️ ${church.city}<br>`
              : ""
          }

          ${
            church.country
              ? `🌍 ${church.country}<br>`
              : ""
          }

          👥 ${memberCount}
          ${
            memberCount === 1
              ? " member"
              : " members"
          }

          <br>

          👤 Created by
          ${church.creator_name}

        </div>

      </div>

    `;

    detailsSection.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

  } catch (error) {

    console.error(
      "❌ CHURCH DETAILS ERROR:",
      error
    );

    content.innerHTML = `

      <p style="
        color:#c00;
        text-align:center;
        padding:30px;
      ">
        Unable to load church details.
      </p>

    `;

  }

}
// =====================================
// MESSAGES
// =====================================

async function openMessages() {

  console.log("💬 Opening Messages");

  const main =
    document.querySelector("main.feed");

  if (!main) {

    console.error(
      "❌ Main feed not found."
    );

    return;
  }

  main.innerHTML = `
    <section
      id="faithconnect-messages"
      style="
        background:white;
        border-radius:12px;
        padding:25px;
        box-shadow:0 3px 12px rgba(0,0,0,0.08);
      "
    >

      <div style="
        margin-bottom:20px;
      ">

        <h2 style="
          margin:0;
          color:#315d52;
        ">
          💬 Messages
        </h2>

        <p style="
          margin:6px 0 0;
          color:#777;
        ">
          Connect privately with other Christians.
        </p>

      </div>

      <div id="messages-users">

        <p style="
          text-align:center;
          color:#777;
          padding:30px;
        ">
          Loading users...
        </p>

      </div>

    </section>
  `;

  try {

    const response =
      await fetch("/api/messages/users");

    const data =
      await response.json();

    console.log(
      "💬 Messages users response:",
      data
    );

    if (!response.ok || !data.success) {

      document.getElementById(
        "messages-users"
      ).innerHTML = `
        <p style="
          text-align:center;
          color:#b00020;
          padding:30px;
        ">
          ${data.message || "Unable to load users."}
        </p>
      `;

      return;
    }

    const users =
      data.users || [];

    if (users.length === 0) {

      document.getElementById(
        "messages-users"
      ).innerHTML = `
        <p style="
          text-align:center;
          color:#777;
          padding:30px;
        ">
          No other users available yet.
        </p>
      `;

      return;
    }

    document.getElementById(
      "messages-users"
    ).innerHTML =
      users.map(function(user) {

        const initial =
          (user.name || "?")
            .charAt(0)
            .toUpperCase();

        const photo =
          user.profile_photo
            ? `
              <img
                src="${user.profile_photo}"
                style="
                  width:50px;
                  height:50px;
                  border-radius:50%;
                  object-fit:cover;
                "
              >
            `
            : `
              <div style="
                width:50px;
                height:50px;
                border-radius:50%;
                background:#315d52;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:20px;
                font-weight:bold;
              ">
                ${initial}
              </div>
            `;

        return `
          <div
            class="message-user-card"
            data-user-id="${user.id}"
            style="
              display:flex;
              align-items:center;
              gap:15px;
              padding:15px;
              border-bottom:1px solid #eee;
              cursor:pointer;
            "
          >

            ${photo}

            <div style="flex:1;">

              <div style="
                font-weight:600;
                color:#333;
              ">
                ${user.name}
              </div>

              <div style="
                color:#999;
                font-size:13px;
                margin-top:3px;
              ">
                Click to message
              </div>

            </div>

            <div style="
              color:#315d52;
              font-size:22px;
            ">
              ›
            </div>

          </div>
        `;

      }).join("");

  } catch (error) {

    console.error(
      "❌ MESSAGES USERS ERROR:",
      error
    );

    const container =
      document.getElementById(
        "messages-users"
      );

    if (container) {

      container.innerHTML = `
        <p style="
          text-align:center;
          color:#b00020;
          padding:30px;
        ">
          Unable to connect to the server.
        </p>
      `;

    }

  }

}
// =====================================
// MESSAGE USER CLICK
// =====================================

document.addEventListener("click", function (event) {

  const userCard =
    event.target.closest(".message-user-card");

  if (!userCard) {
    return;
  }

  const userId =
    userCard.dataset.userId;

  if (!userId) {
    return;
  }

  console.log(
    "💬 Message user clicked:",
    userId
  );

  openConversation(userId);

});
// =====================================
// OPEN PRIVATE CONVERSATION
// =====================================

async function openConversation(userId) {

  console.log(
    "💬 Opening conversation with user:",
    userId
  );
window.currentConversationUserId = userId;
  const messagesSection =
    document.getElementById(
      "faithconnect-messages"
    );

  if (!messagesSection) {
    return;
  }

  messagesSection.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:12px;
      margin-bottom:20px;
    ">

      <button
        id="messagesBackBtn"
        style="
          border:none;
          background:#315d52;
          color:white;
          padding:9px 14px;
          border-radius:8px;
          cursor:pointer;
          font-weight:600;
        "
      >
        ← Back
      </button>

      <div>
        <h2
          id="conversationUserName"
          style="
            margin:0;
            color:#315d52;
          "
        >
          Loading...
        </h2>

        <div style="
          color:#999;
          font-size:13px;
        ">
          Private conversation
        </div>
      </div>

    </div>

    <div
      id="conversationMessages"
      style="
        min-height:350px;
        max-height:500px;
        overflow-y:auto;
        padding:15px;
        background:#f7f7f7;
        border-radius:10px;
      "
    >
      <p style="
        text-align:center;
        color:#777;
      ">
        Loading messages...
      </p>
    </div>

    <div style="
      display:flex;
      gap:10px;
      margin-top:15px;
    ">

      <textarea
        id="messageInput"
        placeholder="Write a message..."
        rows="2"
        style="
          flex:1;
          resize:none;
          padding:12px;
          border:1px solid #ddd;
          border-radius:10px;
          font-family:inherit;
          outline:none;
        "
      ></textarea>

      <button
        id="sendMessageBtn"
        style="
          align-self:flex-end;
          border:none;
          background:#315d52;
          color:white;
          padding:12px 20px;
          border-radius:10px;
          cursor:pointer;
          font-weight:600;
        "
      >
        Send
      </button>

    </div>
  `;

  // =====================================
  // BACK BUTTON
  // =====================================

  document
    .getElementById("messagesBackBtn")
    .addEventListener("click", function () {

      openMessages();

    });

  // =====================================
  // LOAD CONVERSATION
  // =====================================

  try {

    const response =
      await fetch(
        `/api/messages/${userId}`
      );

    const data =
      await response.json();

    if (!response.ok || !data.success) {

      document.getElementById(
        "conversationMessages"
      ).innerHTML = `
        <p style="
          text-align:center;
          color:#b00020;
          padding:30px;
        ">
          ${data.message || "Unable to load conversation."}
        </p>
      `;

      return;
    }

    const conversationUser =
      data.user;

    document.getElementById(
      "conversationUserName"
    ).textContent =
      conversationUser.name;

    renderConversationMessages(
      data.messages || []
    );

  } catch (error) {

    console.error(
      "❌ CONVERSATION LOAD ERROR:",
      error
    );

    document.getElementById(
      "conversationMessages"
    ).innerHTML = `
      <p style="
        text-align:center;
        color:#b00020;
        padding:30px;
      ">
        Unable to connect to the server.
      </p>
    `;

  }

}
// =====================================
// RENDER CONVERSATION MESSAGES
// =====================================

function renderConversationMessages(messages) {

  const container =
    document.getElementById(
      "conversationMessages"
    );

  if (!container) {
    return;
  }

  if (!messages || messages.length === 0) {

    container.innerHTML = `
      <div style="
        text-align:center;
        color:#888;
        padding:50px 20px;
      ">
        <div style="
          font-size:40px;
          margin-bottom:10px;
        ">
          💬
        </div>

        <div style="
          font-weight:600;
          color:#555;
        ">
          No messages yet
        </div>

        <div style="
          font-size:13px;
          margin-top:5px;
        ">
          Send the first message.
        </div>
      </div>
    `;

    return;
  }

  /*
    We use sender_id to identify the
    current user's messages.
  */

  const currentUserId =
    window.currentUserId;

  container.innerHTML =
    messages.map(function(message) {

      const isMine =
        Number(message.sender_id) ===
        Number(currentUserId);

      return `
        <div style="
          display:flex;
          justify-content:${isMine ? "flex-end" : "flex-start"};
          margin-bottom:12px;
        ">

          <div style="
            max-width:70%;
            padding:10px 14px;
            border-radius:14px;
            background:${isMine ? "#315d52" : "white"};
            color:${isMine ? "white" : "#333"};
            box-shadow:0 1px 4px rgba(0,0,0,0.08);
          ">

            <div style="
              font-size:14px;
              line-height:1.5;
              white-space:pre-wrap;
              word-break:break-word;
            ">
              ${escapeMessageHtml(message.content)}
            </div>

            <div style="
              font-size:10px;
              margin-top:5px;
              opacity:0.7;
              text-align:${isMine ? "right" : "left"};
            ">
              ${message.created_at || ""}
            </div>

          </div>

        </div>
      `;

    }).join("");

  // Scroll to newest message
  container.scrollTop =
    container.scrollHeight;

}

// =====================================
// ESCAPE MESSAGE HTML
// =====================================

function escapeMessageHtml(text) {

  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
// =====================================
// SEND MESSAGE
// =====================================

document.addEventListener("click", async function (event) {

  const sendButton =
    event.target.closest("#sendMessageBtn");

  if (!sendButton) {
    return;
  }

  const input =
    document.getElementById("messageInput");

  if (!input) {
    return;
  }

  const content =
    input.value.trim();

  if (!content) {
    return;
  }

  // Get the current conversation user
  const conversationUserId =
    window.currentConversationUserId;

  if (!conversationUserId) {
    alert("Unable to identify the recipient.");
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "Sending...";

  try {

    const response =
      await fetch(
        `/api/messages/${conversationUserId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            content: content
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok || !data.success) {

      alert(
        data.message ||
        "Unable to send message."
      );

      sendButton.disabled = false;
      sendButton.textContent = "Send";

      return;
    }

    // Clear input
    input.value = "";

    // Reload conversation
    const conversationResponse =
      await fetch(
        `/api/messages/${conversationUserId}`
      );

    const conversationData =
      await conversationResponse.json();

    if (
      conversationResponse.ok &&
      conversationData.success
    ) {

      renderConversationMessages(
        conversationData.messages || []
      );

    }

  } catch (error) {

    console.error(
      "❌ SEND MESSAGE ERROR:",
      error
    );

    alert(
      "Unable to connect to the server."
    );

  }

  sendButton.disabled = false;
  sendButton.textContent = "Send";
// =====================================
// HOME BUTTON - REFRESH PAGE
// =====================================

document.addEventListener("click", function (event) {

  const homeLink =
    event.target.closest(".sidebar.left nav a");

  if (!homeLink) {
    return;
  }

  const text =
    homeLink.textContent.trim();

  if (!text.includes("Home")) {
    return;
  }

  console.log("🏠 Home clicked - refreshing page");

  event.preventDefault();

  window.location.href = window.location.pathname;

});
});
// =====================================
// SINGLE CHRISTIAN PHOTO PREVIEW
// =====================================

document.addEventListener("DOMContentLoaded", () => {

  const photoButton =
    document.getElementById("singlePhotoBtn");

  const photoInput =
    document.getElementById("singlePhotoInput");

  const photoPreview =
    document.querySelector(".single-photo-preview");

  if (
    !photoButton ||
    !photoInput ||
    !photoPreview
  ) {
    return;
  }

  photoButton.addEventListener(
    "click",
    () => {
      photoInput.click();
    }
  );

  photoInput.addEventListener(
    "change",
    () => {

      const file =
        photoInput.files[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith("image/")
      ) {
        alert(
          "Please select an image file."
        );

        photoInput.value = "";

        return;
      }

      const reader =
        new FileReader();

      reader.onload = (event) => {

        photoPreview.innerHTML = "";

        const image =
          document.createElement("img");

        image.src =
          event.target.result;

        image.alt =
          "Single Christian profile photo";

        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";

        photoPreview.appendChild(image);

      };

      reader.readAsDataURL(file);

    }
  );

});
// =====================================
// SAVE SINGLE CHRISTIAN PROFILE
// =====================================

document.addEventListener("click", async function (event) {

  const button =
    event.target.closest("#saveSingleChristianBtn");

  if (!button) {
    return;
  }


  const message =
    document.getElementById(
      "singleChristianMessage"
    );


  const photoInput =
    document.getElementById(
      "singlePhotoInput"
    );


  const fullName =
    document.getElementById(
      "singleName"
    )?.value.trim();


  const age =
    document.getElementById(
      "singleAge"
    )?.value;


  const country =
    document.getElementById(
      "singleCountry"
    )?.value.trim();


  const churchName =
    document.getElementById(
      "singleChurch"
    )?.value.trim();


  const occupation =
    document.getElementById(
      "singleOccupation"
    )?.value.trim();


  const aboutMe =
    document.getElementById(
      "singleAbout"
    )?.value.trim();


  const lookingFor =
    document.getElementById(
      "singleLookingFor"
    )?.value.trim();


  const additionalInfo =
    document.getElementById(
      "singleAdditionalInfo"
    )?.value.trim();


  // =====================================
  // REQUIRED INFORMATION
  // =====================================

  if (
    !fullName ||
    !age ||
    !country
  ) {

    if (message) {

      message.textContent =
        "Please enter your full name, age and country.";

      message.style.color =
        "#b00020";

    }

    return;

  }


  // =====================================
  // CREATE FORM DATA
  // =====================================

  const formData =
    new FormData();


  formData.append(
    "fullName",
    fullName
  );

  formData.append(
    "age",
    age
  );

  formData.append(
    "country",
    country
  );

  formData.append(
    "churchName",
    churchName || ""
  );

  formData.append(
    "occupation",
    occupation || ""
  );

  formData.append(
    "aboutMe",
    aboutMe || ""
  );

  formData.append(
    "lookingFor",
    lookingFor || ""
  );

  formData.append(
    "additionalInfo",
    additionalInfo || ""
  );


  // =====================================
  // ADD PROFILE PHOTO
  // =====================================

  if (
    photoInput &&
    photoInput.files &&
    photoInput.files[0]
  ) {

    formData.append(
      "profilePhoto",
      photoInput.files[0]
    );

  }


  // =====================================
  // SAVE
  // =====================================

  button.disabled = true;

  button.textContent =
    "Saving...";


  try {

    // =====================================
    // CHECK IF PROFILE ALREADY EXISTS
    // =====================================

    const profileResponse =
      await fetch(
        "/api/single-christians/me"
      );

    const profileData =
      await profileResponse.json();


    // =====================================
    // EXISTING PROFILE
    // =====================================

    if (
      profileData.success &&
      profileData.profile
    ) {

      if (
        !photoInput ||
        !photoInput.files ||
        !photoInput.files[0]
      ) {

        throw new Error(
          "Your profile already exists. Please select a profile photo."
        );

      }


      const photoFormData =
        new FormData();

      photoFormData.append(
        "profilePhoto",
        photoInput.files[0]
      );


      const photoResponse =
        await fetch(
          "/api/single-christians/me/photo",
          {
            method: "PUT",
            body: photoFormData
          }
        );


      const photoData =
        await photoResponse.json();


      if (
        !photoResponse.ok ||
        !photoData.success
      ) {

        throw new Error(
          photoData.message ||
          "Unable to update your profile photo."
        );

      }


      if (message) {

        message.textContent =
          "✅ Your profile photo has been updated successfully.";

        message.style.color =
          "#236b4b";

      }


      button.textContent =
        "Photo Updated";


      return;

    }


    // =====================================
    // NEW PROFILE
    // =====================================

    const response =
      await fetch(
        "/api/single-christians",
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

      throw new Error(
        data.message ||
        "Unable to create your profile."
      );

    }


    // =====================================
    // SUCCESS
    // =====================================

    if (message) {

      message.textContent =
        "✅ Your Single Christian profile has been created successfully.";

      message.style.color =
        "#236b4b";

    }


    button.textContent =
      "Profile Created";


  } catch (error) {

    console.error(
      "SAVE SINGLE CHRISTIAN PROFILE ERROR:",
      error
    );


    if (message) {

      message.textContent =
        error.message ||
        "Unable to create your profile.";

      message.style.color =
        "#b00020";

    }


    button.disabled = false;

    button.textContent =
      "Create My Profile";

  }

});
// =====================================
// SINGLE CHRISTIANS HOME BUTTON
// =====================================

document.addEventListener("click", function (event) {

  const button =
    event.target.closest(
      "#singleChristiansHomeBtn"
    );

  if (!button) {
    return;
  }

  window.location.href = "/";

});


// =====================================
// SINGLE CHRISTIANS CREATE PROFILE BUTTON
// =====================================

document.addEventListener("click", function (event) {

  const button =
    event.target.closest(
      "#createSingleProfileBtn"
    );

  if (!button) {
    return;
  }

  window.location.href =
    "/create-single-christian.html";

});
// =====================================
// OPEN SINGLE CHRISTIANS PAGE
// =====================================

document.addEventListener("click", function (event) {

  const button =
    event.target.closest("#godsWillBtn");

  if (!button) {
    return;
  }

  window.location.href =
    "/single-christians.html";

});
// =====================================
// LOAD SINGLE CHRISTIAN PROFILES
// =====================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const profileList =
      document.getElementById(
        "singleChristiansList"
      );

    if (!profileList) {
      return;
    }

    console.log(
      "💛 Loading Single Christian Profiles..."
    );

    try {

      const response =
        await fetch(
          "/api/single-christians"
        );

      const data =
        await response.json();

      console.log(
        "💛 SINGLE CHRISTIAN PROFILES:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Unable to load profiles."
        );

      }

      if (
        !data.profiles ||
        data.profiles.length === 0
      ) {

        profileList.innerHTML = `

          <div class="single-christians-empty">

            <div class="single-empty-icon">
              💛
            </div>

            <h2>
              No profiles yet
            </h2>

            <p>
              Be the first Christian to create
              a profile.
            </p>

          </div>

        `;

        return;
      }


      // =====================================
      // DISPLAY PROFILES
      // =====================================

      profileList.innerHTML =
        data.profiles
          .map(function (profile) {

            const photoHTML =
              profile.profile_photo

                ? `
                  <img
                    src="${profile.profile_photo}"
                    alt="${profile.full_name}"
                  >
                `

                : `
                  <div
                    style="
                      width:100%;
                      height:100%;
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-size:45px;
                    "
                  >
                    👤
                  </div>
                `;


            return `

             <article
  class="single-christian-profile-card"
  data-profile-id="${profile.id}"
  style="cursor:pointer;"
>

                <div class="single-profile-photo">

                  ${photoHTML}

                </div>


                <div class="single-profile-info">

                  <h2>
                    ${profile.full_name}
                  </h2>

                  <p>
                    ${profile.age}
                    years old
                    ·
                    ${profile.country}
                  </p>


                  ${
                    profile.church_name
                      ? `
                        <p>
                          ⛪
                          ${profile.church_name}
                        </p>
                      `
                      : ""
                  }


                  ${
                    profile.occupation
                      ? `
                        <p>
                          💼
                          ${profile.occupation}
                        </p>
                      `
                      : ""
                  }


                  ${
                    profile.about_me
                      ? `
                        <p
                          class="single-profile-about"
                        >
                          ${profile.about_me}
                        </p>
                      `
                      : ""
                  }


                  ${
                    profile.looking_for
                      ? `
                        <p>
                          💛 Looking for:
                          ${profile.looking_for}
                        </p>
                      `
                      : ""
                  }


                  ${
                    profile.additional_info
                      ? `
                        <p>
                          ℹ️
                          ${profile.additional_info}
                        </p>
                      `
                      : ""
                  }
<div class="single-profile-message-area">

  ${
    Number(profile.user_id) ===
    Number(window.currentUserId)

      ? `
        <div class="single-profile-own-label">
          💛 This is your profile
        </div>

        <button
          type="button"
          class="single-profile-edit-btn"
          id="editSingleProfileBtn"
        >
          ✏️ Edit My Profile
        </button>
      `

      : `
        <button
          type="button"
          class="single-profile-message-btn"
          id="singleProfileMessageBtn"
          data-user-id="${profile.user_id}"
        >
          💬 Send Private Message
        </button>
      `
  }

</div>
                </div>

              </article>

            `;

          })
          .join("");


    } catch (error) {

      console.error(
        "❌ LOAD SINGLE CHRISTIAN PROFILES ERROR:",
        error
      );

      profileList.innerHTML = `

        <div class="single-christians-empty">

          <div class="single-empty-icon">
            ⚠️
          </div>

          <h2>
            Unable to load profiles
          </h2>

          <p>
            Please try again.
          </p>

        </div>

      `;

    }

  }
);
// =====================================
// SINGLE CHRISTIAN PROFILE CLICK
// =====================================

document.addEventListener("click", function (event) {

  const profileCard =
    event.target.closest(
      ".single-christian-profile-card"
    );

  if (!profileCard) {
    return;
  }

  const profileId =
    profileCard.dataset.profileId;

  if (!profileId) {
    return;
  }

  console.log(
    "💛 Opening Single Christian profile:",
    profileId
  );

  window.location.href =
    "/single-christian-profile.html?id=" +
    encodeURIComponent(profileId);

});
// =====================================
// LOAD SINGLE CHRISTIAN PROFILE DETAILS
// =====================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const profileDetails =
      document.getElementById(
        "singleProfileDetails"
      );

    if (!profileDetails) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const profileId =
      params.get("id");

    if (!profileId) {

      profileDetails.innerHTML = `
        <div class="single-profile-loading">
          <div class="single-empty-icon">⚠️</div>
          <h2>Profile not found</h2>
          <p>No profile was selected.</p>
        </div>
      `;

      return;
    }

    console.log(
      "💛 Loading profile ID:",
      profileId
    );

    try {

      const response =
        await fetch(
          "/api/single-christians"
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Unable to load profiles."
        );
      }

      const profile =
        data.profiles.find(
          function (item) {
            return String(item.id) ===
              String(profileId);
          }
        );

      if (!profile) {

        profileDetails.innerHTML = `
          <div class="single-profile-loading">
            <div class="single-empty-icon">⚠️</div>
            <h2>Profile not found</h2>
            <p>This profile is no longer available.</p>
          </div>
        `;

        return;
      }

      const photoHTML =
        profile.profile_photo
          ? `
            <img
              src="${profile.profile_photo}"
              alt="${profile.full_name}"
            >
          `
          : `
            <div class="single-profile-no-photo">
              👤
            </div>
          `;

      profileDetails.innerHTML = `

        <div class="single-profile-detail-photo">
          ${photoHTML}
        </div>

        <div class="single-profile-detail-info">

          <h2>
            ${profile.full_name}
          </h2>

          <p>
            🎂 ${profile.age} years old
          </p>

          <p>
            🌍 ${profile.country}
          </p>

          ${
            profile.church_name
              ? `
                <p>
                  ⛪ ${profile.church_name}
                </p>
              `
              : ""
          }

          ${
            profile.occupation
              ? `
                <p>
                  💼 ${profile.occupation}
                </p>
              `
              : ""
          }

          ${
            profile.about_me
              ? `
                <div class="single-profile-detail-section">
                  <h3>About Me</h3>
                  <p>
                    ${profile.about_me}
                  </p>
                </div>
              `
              : ""
          }

          ${
            profile.looking_for
              ? `
                <div class="single-profile-detail-section">
                  <h3>💛 What I'm Looking For</h3>
                  <p>
                    ${profile.looking_for}
                  </p>
                </div>
              `
              : ""
          }

          ${
            profile.additional_info
              ? `
                <div class="single-profile-detail-section">
                  <h3>ℹ️ Additional Information</h3>
                  <p>
                    ${profile.additional_info}
                  </p>
                </div>
              `
              : ""
          }

        </div>

      `;

    } catch (error) {

      console.error(
        "❌ LOAD SINGLE CHRISTIAN PROFILE ERROR:",
        error
      );

      profileDetails.innerHTML = `
        <div class="single-profile-loading">
          <div class="single-empty-icon">⚠️</div>
          <h2>Unable to load profile</h2>
          <p>Please try again.</p>
        </div>
      `;

    }

  }
);
// =====================================
// SINGLE CHRISTIAN PROFILE BACK BUTTON
// =====================================

document.addEventListener("click", function (event) {

  const button =
    event.target.closest(
      "#singleProfileBackBtn"
    );

  if (!button) {
    return;
  }

  window.location.href =
    "/single-christians.html";

});
// =====================================
// SINGLE CHRISTIAN PRIVATE MESSAGE
// =====================================

document.addEventListener("click", function (event) {

  const button =
    event.target.closest(
      "#singleProfileMessageBtn"
    );

  if (!button) {
    return;
  }

  const userId =
    button.dataset.userId;

  if (!userId) {

    console.error(
      "❌ Single Christian user ID is missing."
    );

    return;
  }

  console.log(
    "💬 Preparing private chat with user:",
    userId
  );

  sessionStorage.setItem(
    "faithconnectPrivateChatUserId",
    userId
  );

  window.location.href = "/";

});

// =====================================
// SINGLE CHRISTIAN PRIVATE MESSAGE
// =====================================

document.addEventListener("click", function (event) {

  const button =
    event.target.closest(
      "#singleProfileMessageBtn"
    );

  if (!button) {
    return;
  }

  const userId =
    button.dataset.userId;

  if (!userId) {

    console.error(
      "❌ Single Christian user ID is missing."
    );

    return;
  }

  console.log(
    "💬 Opening private chat with Single Christian:",
    userId
  );

  openConversation(userId);

});
// =====================================
// OPEN SINGLE CHRISTIAN PRIVATE CHAT
// =====================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const privateChatUserId =
      sessionStorage.getItem(
        "faithconnectPrivateChatUserId"
      );

    if (!privateChatUserId) {
      return;
    }

    sessionStorage.removeItem(
      "faithconnectPrivateChatUserId"
    );

    console.log(
      "💬 Opening saved private chat:",
      privateChatUserId
    );

    if (
      typeof openMessages === "function"
    ) {
      await openMessages();
    }

    if (
      typeof openConversation === "function"
    ) {
      await openConversation(
        privateChatUserId
      );
    }

  }
);