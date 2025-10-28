import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import adorasLogo from 'figma:asset/ff464e8797ec2866e347b1268d3b9dc2969816ff.png';

interface IconSize {
  size: number;
  filename: string;
}

const ICON_SIZES: IconSize[] = [
  { size: 180, filename: 'apple-touch-icon.png' },
  { size: 152, filename: 'apple-touch-icon-152.png' },
  { size: 120, filename: 'apple-touch-icon-120.png' },
  { size: 192, filename: 'icon-192.png' },
  { size: 512, filename: 'icon-512.png' },
];

export function IconDownloader() {
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    // Load the logo image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = adorasLogo;
    
    img.onload = () => {
      ICON_SIZES.forEach(({ size, filename }) => {
        const canvas = canvasRefs.current[filename];
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = size;
        canvas.height = size;

        // Fill background with Adoras Green
        ctx.fillStyle = '#36453B';
        ctx.fillRect(0, 0, size, size);

        // Calculate dimensions to center the logo with padding
        const padding = size * 0.1; // 10% padding
        const logoSize = size - (padding * 2);

        // Draw the logo centered
        ctx.drawImage(
          img,
          padding,
          padding,
          logoSize,
          logoSize
        );
      });
    };
  }, []);

  const downloadIcon = (filename: string) => {
    const canvas = canvasRefs.current[filename];
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const downloadAll = () => {
    ICON_SIZES.forEach(({ filename }, index) => {
      setTimeout(() => {
        downloadIcon(filename);
      }, index * 500); // Stagger downloads
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Archivo' }}>
          📱 iOS Touch Icon Generator
        </h2>
        <p className="text-muted-foreground" style={{ fontFamily: 'Inter' }}>
          Download these PNG icons and upload them to your <code className="bg-muted px-2 py-1 rounded text-sm">/public</code> folder.
        </p>
      </div>

      <Button onClick={downloadAll} className="w-full sm:w-auto">
        <Download className="w-4 h-4 mr-2" />
        Download All Icons
      </Button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {ICON_SIZES.map(({ size, filename }) => (
          <div key={filename} className="space-y-2">
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={(el) => (canvasRefs.current[filename] = el)}
                className="w-full h-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-foreground">
                {size}×{size}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono break-all">
                {filename}
              </p>
              <Button
                onClick={() => downloadIcon(filename)}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-900">📝 Next Steps:</p>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Download all icons using the button above</li>
          <li>Upload the PNG files to your <code className="bg-white px-1 rounded">/public</code> folder</li>
          <li>The <code className="bg-white px-1 rounded">index.html</code> already references these files</li>
          <li>Delete the app from your home screen</li>
          <li>Reinstall using Safari's "Add to Home Screen"</li>
          <li>The proper Adoras icon should now appear!</li>
        </ol>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold text-amber-900">⚠️ Important:</p>
        <p className="text-sm text-amber-800">
          iOS caches icons aggressively. After uploading new icons:
        </p>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>Delete the existing app from home screen</li>
          <li>Close Safari completely</li>
          <li>Reopen Safari and visit your site</li>
          <li>Add to home screen again</li>
        </ul>
      </div>
    </div>
  );
}
