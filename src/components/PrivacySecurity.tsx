import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Shield, Lock, Eye, EyeOff, Users, Download, Trash2, FileText } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface PrivacySecurityProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacySecurity({ isOpen, onClose }: PrivacySecurityProps) {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Archivo' }}>
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Security
            </DialogTitle>
            <DialogDescription style={{ fontFamily: 'Inter' }}>
              Control your privacy settings and account security
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Security */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'Inter' }}>
                <Lock className="w-4 h-4" />
                SECURITY
              </h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Biometric Login</Label>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                </div>
                <Switch checked={biometricLogin} onCheckedChange={setBiometricLogin} />
              </div>

              <Button variant="outline" className="w-full" onClick={() => {}}>
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>

            <Separator />

            {/* Privacy */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'Inter' }}>
                <Eye className="w-4 h-4" />
                PRIVACY
              </h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Private Profile</Label>
                  <p className="text-sm text-muted-foreground">Only invited people can see your memories</p>
                </div>
                <Switch checked={privateProfile} onCheckedChange={setPrivateProfile} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Share Location Data</Label>
                  <p className="text-sm text-muted-foreground">Allow memories to include location</p>
                </div>
                <Switch checked={shareLocation} onCheckedChange={setShareLocation} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium" style={{ fontFamily: 'Inter' }}>Active Connections</Label>
                  <p className="text-sm text-muted-foreground">Manage who can see your memories</p>
                </div>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>

            <Separator />

            {/* Data & Privacy */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'Inter' }}>
                <FileText className="w-4 h-4" />
                DATA & PRIVACY
              </h4>

              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-destructive flex items-center gap-2" style={{ fontFamily: 'Inter' }}>
                <Trash2 className="w-4 h-4" />
                DANGER ZONE
              </h4>

              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your memories, photos, and data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
