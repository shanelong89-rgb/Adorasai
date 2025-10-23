import React from 'react';
import { Card } from './ui/card';
import { Smartphone, Monitor, TabletSmartphone } from 'lucide-react';
import icon512 from 'figma:asset/3fe1935c438bb2370304ba54a6324fc61eac466e.png';
import icon192 from 'figma:asset/ff464e8797ec2866e347b1268d3b9dc2969816ff.png';

export function PWAIconPreview() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Archivo' }}>
          PWA App Icons
        </h2>
        <p className="text-muted-foreground">
          These icons will appear when users install Adoras to their device
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Large Icon */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Large Icon (512×512)</h3>
              <Monitor className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 flex items-center justify-center">
              <div className="relative">
                <img 
                  src={icon512} 
                  alt="Adoras App Icon 512x512"
                  className="w-32 h-32 rounded-2xl shadow-lg"
                />
              </div>
            </div>
            
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                <strong>Used for:</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>High-resolution displays</li>
                <li>Splash screens</li>
                <li>App store listings</li>
                <li>Desktop installations</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Small Icon */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Standard Icon (192×192)</h3>
              <Smartphone className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 flex items-center justify-center">
              <div className="relative">
                <img 
                  src={icon192} 
                  alt="Adoras App Icon 192x192"
                  className="w-24 h-24 rounded-xl shadow-lg"
                />
              </div>
            </div>
            
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                <strong>Used for:</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Mobile home screens</li>
                <li>App drawers</li>
                <li>Install prompts</li>
                <li>Notification icons</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Preview on Different Platforms */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Platform Preview</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Android */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="w-4 h-4" />
              Android
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center gap-1">
                  <img 
                    src={icon192} 
                    alt="Android icon"
                    className="w-12 h-12 rounded-xl"
                  />
                  <span className="text-[8px] text-white text-center">Adoras</span>
                </div>
              </div>
            </div>
          </div>

          {/* iOS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TabletSmartphone className="w-4 h-4" />
              iOS
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col items-center gap-1">
                  <img 
                    src={icon192} 
                    alt="iOS icon"
                    className="w-12 h-12 rounded-[10px]"
                  />
                  <span className="text-[8px] text-gray-700 text-center">Adoras</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Monitor className="w-4 h-4" />
              Desktop
            </div>
            <div className="bg-gray-100 rounded-lg p-4 space-y-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border flex items-center gap-3">
                <img 
                  src={icon192} 
                  alt="Desktop icon"
                  className="w-10 h-10 rounded-lg"
                />
                <div>
                  <div className="text-xs font-medium">Adoras</div>
                  <div className="text-[10px] text-muted-foreground">Family Memories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical Info */}
      <Card className="p-6 bg-muted/50">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">📋 Technical Details</h4>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium mb-1">Format</p>
              <p className="text-muted-foreground">PNG with transparency</p>
            </div>
            <div>
              <p className="font-medium mb-1">Purpose</p>
              <p className="text-muted-foreground">Any & Maskable (adaptive)</p>
            </div>
            <div>
              <p className="font-medium mb-1">Background</p>
              <p className="text-muted-foreground">ADORAS GREEN (#36453B)</p>
            </div>
            <div>
              <p className="font-medium mb-1">Status</p>
              <p className="text-green-600 font-medium">✅ Production Ready</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="font-medium text-amber-900 mb-1">📝 Note for Production:</p>
        <p className="text-amber-800">
          When deploying to production, export these icons as PNG files (icon-192.png and icon-512.png) 
          and update the paths in manifest.json and index.html. See <code className="bg-amber-100 px-1 rounded">/PWA_ICONS_DEPLOYMENT_GUIDE.md</code> for details.
        </p>
      </div>
    </div>
  );
}
