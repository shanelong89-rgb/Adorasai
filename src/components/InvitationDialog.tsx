/**
 * InvitationDialog Component
 * Handles invitation creation (for Legacy Keepers) and acceptance (for Storytellers)
 * Phase 2c Part 3
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';
import type { UserType } from '../App';

interface InvitationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userType: UserType;
  onCreateInvitation?: (partnerName: string, partnerRelationship: string, phoneNumber: string) => Promise<{ success: boolean; invitationId?: string; message?: string; error?: string }>;
  onAcceptInvitation?: (invitationCode: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export function InvitationDialog({
  isOpen,
  onClose,
  userType,
  onCreateInvitation,
  onAcceptInvitation,
}: InvitationDialogProps) {
  // Create Invitation (for Legacy Keepers)
  const [partnerName, setPartnerName] = useState('');
  const [partnerRelationship, setPartnerRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Accept Invitation (for Storytellers)
  const [invitationCode, setInvitationCode] = useState('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateInvitation = async () => {
    if (!onCreateInvitation) return;

    // Validation
    if (!partnerName.trim()) {
      setError('Please enter their name');
      return;
    }
    if (!partnerRelationship.trim()) {
      setError('Please enter your relationship');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter their phone number');
      return;
    }

    // Basic phone number validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onCreateInvitation(
        partnerName.trim(),
        partnerRelationship.trim(),
        cleanPhone
      );

      if (result.success) {
        setSuccess(result.message || 'Invitation sent successfully!');
        
        // Clear form
        setPartnerName('');
        setPartnerRelationship('');
        setPhoneNumber('');
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!onAcceptInvitation) return;

    // Validation
    if (!invitationCode.trim()) {
      setError('Please enter the invitation code');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onAcceptInvitation(invitationCode.trim());

      if (result.success) {
        setSuccess(result.message || 'Connection established!');
        
        // Clear form
        setInvitationCode('');
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.error || 'Invalid or expired invitation code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPartnerName('');
      setPartnerRelationship('');
      setPhoneNumber('');
      setInvitationCode('');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Archivo', letterSpacing: '-0.05em' }}>
            {userType === 'keeper' ? 'Invite Storyteller' : 'Join Connection'}
          </DialogTitle>
          <DialogDescription style={{ fontFamily: 'Inter' }}>
            {userType === 'keeper' 
              ? 'Send an invitation to a family member or friend to start sharing memories together.'
              : 'Enter the invitation code you received to connect with a Legacy Keeper.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm text-primary" style={{ fontFamily: 'Inter' }}>
                {success}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <X className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive" style={{ fontFamily: 'Inter' }}>
                {error}
              </p>
            </div>
          )}

          {/* Legacy Keeper Form (Create Invitation) */}
          {userType === 'keeper' && !success && (
            <>
              <div className="space-y-2">
                <Label htmlFor="partner-name" style={{ fontFamily: 'Inter' }}>
                  Their Name *
                </Label>
                <Input
                  id="partner-name"
                  placeholder="e.g., Dad, Grandma, Mom"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  disabled={isLoading}
                  style={{ fontFamily: 'Inter' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-relationship" style={{ fontFamily: 'Inter' }}>
                  Relationship *
                </Label>
                <Input
                  id="partner-relationship"
                  placeholder="e.g., Father, Grandmother, Mother"
                  value={partnerRelationship}
                  onChange={(e) => setPartnerRelationship(e.target.value)}
                  disabled={isLoading}
                  style={{ fontFamily: 'Inter' }}>
                </Input>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number" style={{ fontFamily: 'Inter' }}>
                  Phone Number *
                </Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  style={{ fontFamily: 'Inter' }}
                />
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                  They'll receive an SMS with an invitation code to join Adoras.
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                  style={{ fontFamily: 'Inter' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvitation}
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  style={{ fontFamily: 'Inter' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Storyteller Form (Accept Invitation) */}
          {userType === 'teller' && !success && (
            <>
              <div className="space-y-2">
                <Label htmlFor="invitation-code" style={{ fontFamily: 'Inter' }}>
                  Invitation Code *
                </Label>
                <Input
                  id="invitation-code"
                  placeholder="Enter the 6-digit code from SMS"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="text-center tracking-widest text-lg"
                  maxLength={6}
                  style={{ fontFamily: 'Archivo' }}
                />
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                  You should have received this code via SMS from your Legacy Keeper.
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                  style={{ fontFamily: 'Inter' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  style={{ fontFamily: 'Inter' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Join Connection
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
