const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("./fallback.db");

db.serialize(() => {

  /* =========================
     CREATE TABLES FIRST
  ========================= */

  db.run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      image TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      video_url TEXT,
      thumbnail TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      image TEXT,
      created_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS hero (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      image TEXT,
      button_text TEXT
    )
  `);

  /* =========================
     INSERT DATA AFTER TABLES
  ========================= */

  // Clear existing data first
  db.run("DELETE FROM gallery");
  db.run("DELETE FROM videos");
  db.run("DELETE FROM news");
  db.run("DELETE FROM hero");

  // Insert sample data
  db.run(`INSERT INTO gallery (title, image) VALUES ('Sample Image', '/images/sample.jpg')`);
  db.run(`INSERT INTO videos (title, video_url, thumbnail) VALUES ('Sample Video', 'https://example.com/video.mp4', '/thumb.jpg')`);
  db.run(`INSERT INTO news (title, content, image, created_at)
           VALUES ('Breaking News', 'Fallback news content', '/news.jpg', datetime('now'))`);
  db.run(`INSERT INTO hero (title, subtitle, image, button_text)
           VALUES ('Welcome', 'Fallback Hero Section', '/hero.jpg', 'Read More')`);

  console.log("Fallback data inserted!");
});

db.close();