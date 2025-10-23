// PWA Icons - Import references for deployment
// These images will be used as app icons when installed

import icon512 from 'figma:asset/3fe1935c438bb2370304ba54a6324fc61eac466e.png';
import icon192 from 'figma:asset/ff464e8797ec2866e347b1268d3b9dc2969816ff.png';

export const PWA_ICONS = {
  icon512: icon512, // 512x512 - High resolution icon
  icon192: icon192, // 192x192 - Standard resolution icon
};

// For production deployment:
// 1. Download these images from Figma
// 2. Rename them to icon-512.png and icon-192.png
// 3. Place them in the /public/ folder
// 4. Update manifest.json to use /icon-192.png and /icon-512.png instead of figma:asset URLs
