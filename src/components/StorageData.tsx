import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Database, HardDrive, Image, Video, Mic, FileText, Cloud, Download, Trash2, Settings } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StorageDataProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StorageData({ isOpen, onClose }: StorageDataProps) {
  const [autoBackup, setAutoBackup] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [compressPhotos, setCompressPhotos] = useState(false);
  const [compressVideos, setCompressVideos] = useState(true);

  // Mock storage data
  const totalStorage = 15; // GB
  const usedStorage = 3.2; // GB
  const storagePercentage = (usedStorage / totalStorage) * 100;

  const storageByType = [
    { type: 'Photos', icon: Image, size: 1.5, color: 'text-blue-500' },
    { type: 'Videos', icon: Video, size: 1.2, color: 'text-purple-500' },
    { type: 'Voice Notes', icon: Mic, size: 0.3, color: 'text-green-500' },
    { type: 'Documents', icon: FileText, size: 0.2, color: 'text-orange-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Archivo' }}>
            <Database className="w-5 h-5 text-primary" />
            Storage & Data
          </DialogTitle>
          <DialogDescription style={{ fontFamily: 'Inter' }}>
            Manage your storage usage and backup settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Storage Overview */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium" style={{ fontFamily: 'Inter' }}>Storage Used</p>
                      <p className="text-xs text-muted-foreground">{usedStorage} GB of {totalStorage} GB</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{Math.round(storagePercentage)}%</Badge>
                </div>
                <Progress value={storagePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Storage Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
              STORAGE BREAKDOWN
            </h4>
            {storageByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm" style={{ fontFamily: 'Inter' }}>{item.type}</span>
                </div>
                <Badge variant="outline" className="text-xs">{item.size} GB</Badge>
              </div>
            ))}
          </div>

          <Separator />

          {/* Backup Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'Inter' }}>
              <Cloud className="w-4 h-4" />
              BACKUP SETTINGS
            </h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup to cloud</p>
              </div>
              <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Backup on Wi-Fi Only</Label>
                <p className="text-sm text-muted-foreground">Save mobile data usage</p>
              </div>
              <Switch checked={wifiOnly} onCheckedChange={setWifiOnly} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Last Backup</Label>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <Button variant="outline" size="sm">
                Backup Now
              </Button>
            </div>
          </div>

          <Separator />

          {/* Data Optimization */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'Inter' }}>
              <Settings className="w-4 h-4" />
              DATA OPTIMIZATION
            </h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Compress Photos</Label>
                <p className="text-sm text-muted-foreground">Reduce photo file sizes</p>
              </div>
              <Switch checked={compressPhotos} onCheckedChange={setCompressPhotos} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Compress Videos</Label>
                <p className="text-sm text-muted-foreground">Reduce video file sizes</p>
              </div>
              <Switch checked={compressVideos} onCheckedChange={setCompressVideos} />
            </div>
          </div>

          <Separator />

          {/* Storage Actions */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download All Data
            </Button>

            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache ({(usedStorage * 0.1).toFixed(1)} GB)
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose} className="bg-primary">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
