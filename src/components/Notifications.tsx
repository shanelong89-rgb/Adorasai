import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bell, BellOff, MessageSquare, Camera, Mic, Calendar } from 'lucide-react';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Notifications({ isOpen, onClose }: NotificationsProps) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [newMemories, setNewMemories] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [promptReminders, setPromptReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Archivo' }}>
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </DialogTitle>
          <DialogDescription style={{ fontFamily: 'Inter' }}>
            Manage how you receive notifications about new memories and updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notification Channels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Get updates via email</p>
              </div>
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Sound</Label>
                <p className="text-sm text-muted-foreground">Play sound for notifications</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
              NOTIFY ME ABOUT
            </h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>New Memories</Label>
                  <p className="text-sm text-muted-foreground">Photos, videos, and voice notes</p>
                </div>
              </div>
              <Switch checked={newMemories} onCheckedChange={setNewMemories} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>New Messages</Label>
                  <p className="text-sm text-muted-foreground">Chat messages from storytellers</p>
                </div>
              </div>
              <Switch checked={newMessages} onCheckedChange={setNewMessages} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Daily Prompts</Label>
                  <p className="text-sm text-muted-foreground">Remind me to share memories</p>
                </div>
              </div>
              <Switch checked={promptReminders} onCheckedChange={setPromptReminders} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <div>
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Summary of activity each week</p>
                </div>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">Mute notifications during specific times</p>
              </div>
              <Badge variant="outline" className="text-xs">
                9 PM - 8 AM
              </Badge>
            </div>
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
