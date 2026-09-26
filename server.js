const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const session = require("express-session");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
// =====================================
// PROFILE PHOTO UPLOAD
// =====================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const filename = `profile-${req.session.userId}-${Date.now()}${extension}`;

    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."));
    }
  }
});
// =====================================
// DATABASE
// =====================================

const db = new Database(
  path.join(__dirname, "database", "faithconnect.db")
);

db.pragma("foreign_keys = ON");

// =====================================
// DATABASE TABLES
// =====================================

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile_photo TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id)
      ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS amens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
      ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id)
      ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id)
      ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,

    content TEXT NOT NULL,

    is_read INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CHECK(sender_id != receiver_id),

    FOREIGN KEY (sender_id)
      REFERENCES users(id)
      ON DELETE CASCADE,

    FOREIGN KEY (receiver_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN post_type TEXT DEFAULT 'text'
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN media_url TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}


try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN bible_book TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN bible_chapter TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN bible_verse TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN bible_text TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

// =====================================
// SINGLE CHRISTIAN PROFILES
// =====================================

db.exec(`
  CREATE TABLE IF NOT EXISTS single_christian_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL UNIQUE,

    full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    country TEXT NOT NULL,
    church_name TEXT,
    occupation TEXT,
    about_me TEXT,
    looking_for TEXT,
    additional_info TEXT,

    profile_photo TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
   secret: process.env.SESSION_SECRET || "local-development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

// Give routes access to SQLite
app.use((req, res, next) => {
  req.db = db;
  next();
});


// =====================================
// AUTHENTICATION ROUTES
// =====================================

const authRoutes = require("./routes/auth");
const messagesRoutes = require("./routes/messages");

const singleChristianRoutes =
  require("./routes/singleChristians");

app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);

app.use(
  "/api/single-christians",
  singleChristianRoutes
);


const postRoutes = require("./routes/posts");

app.use("/api/posts", postRoutes);

const photoPostRoutes = require("./routes/photoPosts");

app.use("/api/posts/photo", photoPostRoutes);

const videoPostRoutes = require("./routes/videoPosts");

app.use("/api/posts/video", videoPostRoutes);


const bibleVersePostRoutes =
  require("./routes/bibleVersePosts");

app.use(
  "/api/posts/bible-verse",
  bibleVersePostRoutes
);


const prayerRequestRoutes =
  require("./routes/prayerRequests");

app.use(
  "/api/posts/prayer-request",
  prayerRequestRoutes
);

// =====================================
// GROUPS ROUTES
// =====================================

const groupRoutes =
  require("./routes/groups");

app.use(
  "/api/groups",
  groupRoutes
);
// =====================================
// CHURCHES ROUTES
// =====================================

const churchRoutes =
  require("./routes/churches");

app.use(
  "/api/churches",
  churchRoutes
);
// =====================================
// GROUP POSTS ROUTES
// =====================================

const groupPostRoutes =
  require("./routes/groupPosts");

app.use(
  "/api/group-posts",
  groupPostRoutes
);

// Prayer Request columns
try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN prayer_title TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN prayer_request TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN prayer_message TEXT
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

// =====================================
// PRAYER ANSWERED + I PRAYED
// =====================================

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN prayer_answered INTEGER DEFAULT 0
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

try {
  db.prepare(`
    ALTER TABLE posts
    ADD COLUMN prayer_answered_at DATETIME
  `).run();
} catch (error) {
  if (!error.message.includes("duplicate column name")) {
    throw error;
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS prayer_prayers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(post_id, user_id),

    FOREIGN KEY (post_id)
      REFERENCES posts(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
// =====================================
// GROUPS
// =====================================

db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(group_id, user_id),

    FOREIGN KEY (group_id)
      REFERENCES groups(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
// =====================================
// GROUPS
// =====================================

db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(group_id, user_id),

    FOREIGN KEY (group_id)
      REFERENCES groups(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
// =====================================
// GROUP POSTS
// =====================================

db.exec(`
  CREATE TABLE IF NOT EXISTS group_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id)
      REFERENCES groups(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
// =====================================
// CHURCHES
// =====================================

db.exec(`
  CREATE TABLE IF NOT EXISTS churches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS church_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    church_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(church_id, user_id),

    FOREIGN KEY (church_id)
      REFERENCES churches(id)
      ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );
`);
// =====================================
// FRONTEND
// =====================================

app.use(express.static(path.join(__dirname, "public")));

// Profile photos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================
// SERVER STATUS
// =====================================

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "FaithConnect V2 server is running",
    loggedIn: Boolean(req.session.userId)
  });
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
  console.log("");
  console.log("====================================");
  console.log("       FAITHCONNECT V2");
  console.log("====================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log("Database: SQLite");
  console.log("Status: Running");
  console.log("====================================");
  console.log("");
});