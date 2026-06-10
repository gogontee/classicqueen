const db = require("../lib/fallback-db.js");
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client inside the service
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

class FallbackService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
  }

  // Generic error handler for Supabase fallback
  async executeWithFallback(supabasePromise, fallbackFunction, errorMessage) {
    try {
      const result = await supabasePromise;
      if (result.error) throw new Error(result.error.message);
      this.isOnline = true;
      return { data: result.data, source: "supabase" };
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      this.isOnline = false;
      
      try {
        const fallbackData = await fallbackFunction();
        return { data: fallbackData, source: "fallback" };
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return { data: [], source: "none" };
      }
    }
  }

  // HERO SECTION FALLBACK
  async getHero() {
    return this.executeWithFallback(
      this.getHeroFromSupabase(),
      () => this.getHeroFromFallback(),
      "Failed to fetch hero from Supabase"
    );
  }

  async getHeroFromSupabase() {
    const { data, error } = await supabase
      .from('classicqueen')
      .select('hero')
      .eq('id', 1989)
      .single();
    
    if (error) throw error;
    
    if (data?.hero) {
      let itemsArray;
      if (Array.isArray(data.hero)) {
        itemsArray = data.hero;
      } else {
        try {
          itemsArray = JSON.parse(data.hero || '[]');
        } catch {
          itemsArray = [];
        }
      }
      
      const formattedItems = itemsArray.map(item => ({
        ...item,
        cta: {
          href: item.cta?.href || '/register',
          label: item.cta?.label || 'REGISTER NOW'
        }
      }));
      
      return formattedItems;
    }
    
    return [];
  }

  async getHeroFromFallback() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM hero", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const formattedItems = (rows || []).map(row => ({
            cta: { 
              href: '/register', 
              label: row.button_text || 'REGISTER NOW' 
            },
            src: row.image,
            type: row.image?.endsWith('.mp4') ? 'video' : 'image',
            title: row.title,
            subtitle: row.subtitle
          }));
          resolve(formattedItems);
        }
      });
    });
  }

  // GALLERY FALLBACK
  async getGallery() {
    return this.executeWithFallback(
      this.getGalleryFromSupabase(),
      () => this.getGalleryFromFallback(),
      "Failed to fetch gallery from Supabase"
    );
  }

  async getGalleryFromSupabase() {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return data;
  }

  async getGalleryFromFallback() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM gallery ORDER BY id", (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      });
    });
  }

  // VIDEOS FALLBACK
  async getVideos() {
    return this.executeWithFallback(
      this.getVideosFromSupabase(),
      () => this.getVideosFromFallback(),
      "Failed to fetch videos from Supabase"
    );
  }

  async getVideosFromSupabase() {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return data;
  }

  async getVideosFromFallback() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM videos ORDER BY id", (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      });
    });
  }

  // NEWS FALLBACK
  async getNews() {
    return this.executeWithFallback(
      this.getNewsFromSupabase(),
      () => this.getNewsFromFallback(),
      "Failed to fetch news from Supabase"
    );
  }

  async getNewsFromSupabase() {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getNewsFromFallback() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM news ORDER BY created_at DESC", (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      });
    });
  }

  // SYNC DATA FROM SUPABASE TO FALLBACK
  async syncToFallback() {
    try {
      const heroData = await this.getHeroFromSupabase();
      if (heroData.length > 0) {
        const heroItem = heroData[0];
        await this.clearAndInsertHero({
          title: heroItem.title || '',
          subtitle: heroItem.subtitle || '',
          image: heroItem.src || '',
          button_text: heroItem.cta?.label || 'REGISTER NOW'
        });
      }

      const galleryData = await this.getGalleryFromSupabase();
      if (galleryData.length > 0) {
        await this.clearAndInsertGallery(galleryData);
      }

      const videosData = await this.getVideosFromSupabase();
      if (videosData.length > 0) {
        await this.clearAndInsertVideos(videosData);
      }

      const newsData = await this.getNewsFromSupabase();
      if (newsData.length > 0) {
        await this.clearAndInsertNews(newsData);
      }

      console.log("Successfully synced data to fallback database");
      return true;
    } catch (error) {
      console.error("Failed to sync to fallback:", error);
      return false;
    }
  }

  // Helper methods for syncing
  clearAndInsertHero(hero) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM hero", (err) => {
          if (err) reject(err);
        });
        db.run(
          `INSERT INTO hero (title, subtitle, image, button_text) 
           VALUES (?, ?, ?, ?)`,
          [hero.title, hero.subtitle, hero.image, hero.button_text],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    });
  }

  clearAndInsertGallery(galleryItems) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM gallery", (err) => {
          if (err) reject(err);
        });
        
        const stmt = db.prepare(
          "INSERT INTO gallery (title, image) VALUES (?, ?)"
        );
        
        galleryItems.forEach(item => {
          stmt.run([item.title, item.image]);
        });
        
        stmt.finalize((err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  clearAndInsertVideos(videos) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM videos", (err) => {
          if (err) reject(err);
        });
        
        const stmt = db.prepare(
          "INSERT INTO videos (title, video_url, thumbnail) VALUES (?, ?, ?)"
        );
        
        videos.forEach(video => {
          stmt.run([video.title, video.video_url, video.thumbnail]);
        });
        
        stmt.finalize((err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  clearAndInsertNews(newsItems) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM news", (err) => {
          if (err) reject(err);
        });
        
        const stmt = db.prepare(
          "INSERT INTO news (title, content, image, created_at) VALUES (?, ?, ?, ?)"
        );
        
        newsItems.forEach(item => {
          stmt.run([item.title, item.content, item.image, item.created_at]);
        });
        
        stmt.finalize((err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  // Check connection status
  getStatus() {
    return {
      isOnline: this.isOnline,
      usingFallback: !this.isOnline
    };
  }
}

module.exports = new FallbackService();