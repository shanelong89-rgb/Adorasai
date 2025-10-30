/**
 * InvitationManagement Component
 * Allows keepers to view and manage their sent invitations
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Copy, Mail, Phone, Trash2, RefreshCw, Check, X, Loader2, Clock, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { format } from 'date-fns';

interface Invitation {
  id: string;
  code: string;
  keeperId: string;
  tellerPhoneNumber: string;
  tellerName?: string;
  tellerRelationship?: string;
  status: 'sent' | 'accepted' | 'expired';
  sentAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

interface InvitationManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
}

export function InvitationManagement({ isOpen, onClose, onCreateNew }: InvitationManagementProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load invitations
  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getInvitations();
      
      if (response.success && response.invitations) {
        // Sort by most recent first
        const sorted = response.invitations.sort((a: Invitation, b: Invitation) => 
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
        setInvitations(sorted);
      } else {
        console.error('Failed to load invitations:', response.error);
        toast.error('Failed to load invitations');
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handleDeleteInvitation = async (invitationId: string, code: string) => {
    if (!confirm('Are you sure you want to delete this invitation? This cannot be undone.')) {
      return;
    }

    setDeletingId(invitationId);
    try {
      const response = await apiClient.deleteInvitation(code);
      
      if (response.success) {
        toast.success('Invitation deleted successfully');
        // Remove from local state
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        toast.error(response.error || 'Failed to delete invitation');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'accepted':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'expired':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'sent' && !isExpired(inv.expiresAt));
  const acceptedInvitations = invitations.filter(inv => inv.status === 'accepted');
  const expiredInvitations = invitations.filter(inv => inv.status === 'expired' || (inv.status === 'sent' && isExpired(inv.expiresAt)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Archivo', letterSpacing: '-0.05em' }}>
            Manage Invitations
          </DialogTitle>
          <DialogDescription style={{ fontFamily: 'Inter' }}>
            View and manage all your sent invitations
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Mail className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Archivo' }}>
              No Invitations Yet
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6" style={{ fontFamily: 'Inter' }}>
              You haven't sent any invitations yet. Create your first invitation to start sharing memories.
            </p>
            <Button onClick={() => { onClose(); onCreateNew(); }} className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Create Invitation
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter' }}>
                      Pending ({pendingInvitations.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingInvitations.map((invitation) => (
                        <InvitationCard
                          key={invitation.id}
                          invitation={invitation}
                          onCopy={copyToClipboard}
                          onDelete={handleDeleteInvitation}
                          isDeleting={deletingId === invitation.id}
                          getStatusIcon={getStatusIcon}
                          getStatusColor={getStatusColor}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Invitations */}
                {acceptedInvitations.length > 0 && (
                  <div>
                    {pendingInvitations.length > 0 && <Separator className="my-4" />}
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter' }}>
                      Accepted ({acceptedInvitations.length})
                    </h3>
                    <div className="space-y-3">
                      {acceptedInvitations.map((invitation) => (
                        <InvitationCard
                          key={invitation.id}
                          invitation={invitation}
                          onCopy={copyToClipboard}
                          onDelete={handleDeleteInvitation}
                          isDeleting={deletingId === invitation.id}
                          getStatusIcon={getStatusIcon}
                          getStatusColor={getStatusColor}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Expired Invitations */}
                {expiredInvitations.length > 0 && (
                  <div>
                    {(pendingInvitations.length > 0 || acceptedInvitations.length > 0) && <Separator className="my-4" />}
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter' }}>
                      Expired ({expiredInvitations.length})
                    </h3>
                    <div className="space-y-3">
                      {expiredInvitations.map((invitation) => (
                        <InvitationCard
                          key={invitation.id}
                          invitation={invitation}
                          onCopy={copyToClipboard}
                          onDelete={handleDeleteInvitation}
                          isDeleting={deletingId === invitation.id}
                          getStatusIcon={getStatusIcon}
                          getStatusColor={getStatusColor}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={loadInvitations} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => { onClose(); onCreateNew(); }} className="bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface InvitationCardProps {
  invitation: Invitation;
  onCopy: (text: string, label: string) => void;
  onDelete: (id: string, code: string) => void;
  isDeleting: boolean;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
}

function InvitationCard({ invitation, onCopy, onDelete, isDeleting, getStatusIcon, getStatusColor }: InvitationCardProps) {
  const canDelete = invitation.status === 'sent' || invitation.status === 'expired';
  
  return (
    <div className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold" style={{ fontFamily: 'Archivo' }}>
              {invitation.tellerName || 'Unnamed Contact'}
            </h4>
            <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
              {getStatusIcon(invitation.status)}
              <span className="capitalize">{invitation.status}</span>
            </Badge>
          </div>
          {invitation.tellerRelationship && (
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
              {invitation.tellerRelationship}
            </p>
          )}
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(invitation.id, invitation.code)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {/* Invitation Code */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>Code:</span>
            <code className="font-mono font-semibold text-sm" style={{ fontFamily: 'monospace' }}>
              {invitation.code}
            </code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(invitation.code, 'Invitation code')}
            className="h-7 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>

        {/* Phone Number */}
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded border">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm" style={{ fontFamily: 'Inter' }}>
              {invitation.tellerPhoneNumber}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(invitation.tellerPhoneNumber, 'Phone number')}
            className="h-7 px-2"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground" style={{ fontFamily: 'Inter' }}>
        <div>
          <span className="font-medium">Sent:</span> {format(new Date(invitation.sentAt), 'MMM d, yyyy')}
        </div>
        {invitation.status === 'accepted' && invitation.acceptedAt && (
          <div>
            <span className="font-medium">Accepted:</span> {format(new Date(invitation.acceptedAt), 'MMM d, yyyy')}
          </div>
        )}
        {invitation.status === 'sent' && (
          <div>
            <span className="font-medium">Expires:</span> {format(new Date(invitation.expiresAt), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
}
