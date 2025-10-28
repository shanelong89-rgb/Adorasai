// Dynamic manifest generator
// This file generates the manifest.json dynamically based on the current origin

export function generateManifest() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    "name": "Adoras - Family Memory Sharing",
    "short_name": "Adoras",
    "description": "Reconnect with family through shared memories, stories, photos, and voice notes",
    "start_url": "/",
    "scope": "/",
    "display": "fullscreen",
    "display_override": ["fullscreen", "standalone", "minimal-ui"],
    "background_color": "#F5F9E9",
    "theme_color": "#36453B",
    "orientation": "portrait-primary",
    "prefer_related_applications": false,
    "icons": [
      {
        "src": `${origin}/icon-192.png`,
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": `${origin}/icon-512.png`,
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": `${origin}/apple-touch-icon.png`,
        "sizes": "180x180",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "categories": ["social", "lifestyle", "productivity"],
    "lang": "en-US",
    "dir": "ltr"
  };
}
