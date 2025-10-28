/**
 * Adoras Invitation & Connection Management
 * 
 * Handles SMS invitations, connection creation, and multi-user relationships
 */

import * as kv from './kv_store.tsx';
import {
  Invitation,
  Connection,
  UserProfile,
  Keys,
  generateId,
  generateInvitationCode,
  Validators,
} from './database.tsx';

/**
 * Create and send SMS invitation
 * 
 * Note: Actual SMS sending requires Twilio API key
 * User must configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
export async function createInvitation(params: {
  keeperId: string;
  tellerPhoneNumber: string;
  tellerName?: string;
  tellerBirthday?: string;
  tellerRelationship?: string;
  tellerBio?: string;
  tellerPhoto?: string;
  code?: string; // Optional: Use provided code or generate new one
}) {
  try {
    // Validate phone number
    if (!Validators.phoneNumber(params.tellerPhoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    // Get keeper profile
    const keeper = await kv.get<UserProfile>(Keys.user(params.keeperId));
    if (!keeper) {
      throw new Error('Keeper not found');
    }

    // Use provided code or generate new one
    const code = params.code || generateInvitationCode();
    const invitationId = generateId();
    
    console.log('📝 Creating invitation with code:', code, 'for keeper:', keeper.name);

    // Create invitation with storyteller pre-fill data
    const invitation: Invitation = {
      id: invitationId,
      code,
      keeperId: params.keeperId,
      tellerPhoneNumber: params.tellerPhoneNumber,
      tellerName: params.tellerName,
      tellerBirthday: params.tellerBirthday,
      tellerRelationship: params.tellerRelationship,
      tellerBio: params.tellerBio,
      tellerPhoto: params.tellerPhoto,
      status: 'sent',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    // Store invitation
    await kv.set(Keys.invitation(code), invitation);

    // Add to keeper's invitations list
    const keeperInvitations = await kv.get<string[]>(Keys.userInvitations(params.keeperId)) || [];
    keeperInvitations.push(code);
    await kv.set(Keys.userInvitations(params.keeperId), keeperInvitations);

    console.log('✅ Invitation created and stored successfully');

    // Send SMS (if Twilio is configured) - Non-blocking, errors are acceptable
    let smsResult = { success: false, error: 'SMS not attempted' };
    try {
      smsResult = await sendInvitationSMS({
        phoneNumber: params.tellerPhoneNumber,
        code,
        keeperName: keeper.name,
      });
      
      if (smsResult.success) {
        console.log('✅ SMS sent successfully');
      } else {
        console.log('ℹ️ SMS not sent:', smsResult.error);
      }
    } catch (smsError) {
      console.log('ℹ️ SMS sending failed (non-critical):', smsError instanceof Error ? smsError.message : 'Unknown error');
      smsResult = {
        success: false,
        error: 'SMS sending failed - invitation still valid',
      };
    }

    return {
      success: true,
      invitation,
      smsSent: smsResult.success,
      smsError: smsResult.error,
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send SMS invitation using Twilio
 */
async function sendInvitationSMS(params: {
  phoneNumber: string;
  code: string;
  keeperName: string;
}) {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromPhone) {
      console.warn('Twilio credentials not configured. SMS not sent.');
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    const message = `${params.keeperName} invited you to share memories on Adoras! 📸\n\nYour code: ${params.code}\n\nDownload: https://whole-works-409347.framer.app/`;

    // Twilio API call
    const auth = btoa(`${accountSid}:${authToken}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromPhone,
          To: params.phoneNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio API error: ${error}`);
    }

    const result = await response.json();

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify invitation code
 */
export async function verifyInvitationCode(code: string) {
  try {
    console.log('🔍 Verifying invitation code:', code);

    if (!Validators.invitationCode(code)) {
      console.error('❌ Invalid invitation code format:', code);
      throw new Error('Invalid invitation code format');
    }

    console.log('✅ Code format valid');

    const kvKey = Keys.invitation(code);
    console.log('🔑 Looking up KV key:', kvKey);

    const invitation = await kv.get<Invitation>(kvKey);

    if (!invitation) {
      console.error('❌ Invitation not found in KV store for code:', code);
      console.log('💡 Tip: Make sure an invitation was created first by a Keeper');
      
      // Debug: List all invitation keys
      try {
        const allInvitations = await kv.getByPrefix<Invitation>(Keys.prefixes.invitations);
        console.log('📋 Total invitations in database:', allInvitations.length);
        if (allInvitations.length > 0) {
          console.log('📋 Available invitation codes:', allInvitations.map(inv => inv.code).join(', '));
        } else {
          console.log('📋 No invitations in database. A keeper needs to create one first.');
        }
      } catch (debugError) {
        console.error('Debug error listing invitations:', debugError);
      }

      // SPECIAL HANDLING: Auto-create test invitation for TESTCODE
      // ⚠️ DEVELOPMENT/TESTING ONLY: Auto-create test invitation for TESTCODE
      // This code should NOT appear in production. Real invitations use unique codes.
      if (code === 'TESTCODE') {
        console.log('🧪 TEST MODE: Auto-creating TESTCODE invitation...');
        
        // Find Shane Long's user profile
        const allUsers = await kv.getByPrefix<UserProfile>(Keys.prefixes.users);
        const shaneProfile = allUsers.find(u => u.email === 'shanelong@gmail.com');
        
        if (!shaneProfile) {
          throw new Error('Cannot create test invitation: Shane Long (shanelong@gmail.com) not found. Please sign up first.');
        }
        
        console.log('✅ Found Shane Long, creating test invitation');
        
        // Create test invitation
        const testInvitation: Invitation = {
          id: generateId(),
          code: code,
          keeperId: shaneProfile.id,
          tellerPhoneNumber: '+1234567890',
          tellerName: 'Allison Tam',
          status: 'sent',
          sentAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        };
        
        await kv.set(Keys.invitation(code), testInvitation);
        
        // Add to Shane's invitations list
        const shaneInvitations = await kv.get<string[]>(Keys.userInvitations(shaneProfile.id)) || [];
        if (!shaneInvitations.includes(code)) {
          shaneInvitations.push(code);
          await kv.set(Keys.userInvitations(shaneProfile.id), shaneInvitations);
        }
        
        console.log('✅ Test invitation TESTCODE created successfully');
        
        return {
          success: true,
          invitation: testInvitation,
          keeper: shaneProfile,
          autoCreated: true,
        };
      }

      throw new Error('Invitation code not found');
    }

    console.log('✅ Invitation found:', {
      id: invitation.id,
      code: invitation.code,
      keeperId: invitation.keeperId,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    });

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      console.error('❌ Invitation expired:', invitation.expiresAt);
      return {
        success: false,
        error: 'Invitation code has expired',
      };
    }

    // SPECIAL HANDLING: Auto-reset test invitation TESTCODE if already accepted
    if (invitation.status === 'accepted' && code === 'TESTCODE') {
      console.log('🧪 TEST MODE: TESTCODE already accepted, auto-resetting...');
      
      // Import the reset function (we'll need to create a helper)
      const allUsers = await kv.getByPrefix<UserProfile>(Keys.prefixes.users);
      const shaneProfile = allUsers.find(u => u.email === 'shanelong@gmail.com');
      const allisonProfile = allUsers.find(u => u.email === 'allison.tam@hotmail.com');
      
      // Delete existing connections
      if (shaneProfile) {
        const shaneConnections = await kv.get<string[]>(Keys.userConnections(shaneProfile.id)) || [];
        for (const connId of shaneConnections) {
          const conn = await kv.get<Connection>(Keys.connection(connId));
          if (conn && conn.invitationCode === code) {
            await kv.del(Keys.connection(connId));
            await kv.del(Keys.connectionMemories(connId));
          }
        }
        const updatedShaneConnections = [];
        for (const connId of shaneConnections) {
          const conn = await kv.get<Connection>(Keys.connection(connId));
          if (conn) updatedShaneConnections.push(connId);
        }
        await kv.set(Keys.userConnections(shaneProfile.id), updatedShaneConnections);
      }
      
      if (allisonProfile) {
        const allisonConnections = await kv.get<string[]>(Keys.userConnections(allisonProfile.id)) || [];
        for (const connId of allisonConnections) {
          const conn = await kv.get<Connection>(Keys.connection(connId));
          if (conn && conn.invitationCode === code) {
            await kv.del(Keys.connection(connId));
            await kv.del(Keys.connectionMemories(connId));
          }
        }
        const updatedAllisonConnections = [];
        for (const connId of allisonConnections) {
          const conn = await kv.get<Connection>(Keys.connection(connId));
          if (conn) updatedAllisonConnections.push(connId);
        }
        await kv.set(Keys.userConnections(allisonProfile.id), updatedAllisonConnections);
      }
      
      // Reset invitation status
      invitation.status = 'sent';
      delete invitation.acceptedAt;
      await kv.set(Keys.invitation(code), invitation);
      
      console.log('✅ Test invitation reset successfully, now status:', invitation.status);
      
      // Get keeper info
      const keeper = await kv.get<UserProfile>(Keys.user(invitation.keeperId));
      
      return {
        success: true,
        invitation,
        keeper,
        autoReset: true,
      };
    }

    // Check if already accepted (for non-test invitations)
    if (invitation.status === 'accepted') {
      console.error('❌ Invitation already accepted');
      return {
        success: false,
        error: 'Invitation code has already been used',
      };
    }

    console.log('✅ Invitation is valid, fetching keeper profile');

    // Get keeper info
    const keeper = await kv.get<UserProfile>(Keys.user(invitation.keeperId));

    if (!keeper) {
      console.error('❌ Keeper profile not found for ID:', invitation.keeperId);
    } else {
      console.log('✅ Keeper found:', keeper.name);
    }

    return {
      success: true,
      invitation,
      keeper,
    };
  } catch (error) {
    console.error('❌ Error verifying invitation code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Accept invitation and create connection
 */
export async function acceptInvitation(params: {
  code: string;
  tellerId: string;
}) {
  try {
    // Verify invitation
    const verifyResult = await verifyInvitationCode(params.code);
    if (!verifyResult.success || !verifyResult.invitation) {
      throw new Error(verifyResult.error || 'Invalid invitation');
    }

    const invitation = verifyResult.invitation;

    // Create connection
    const connectionId = generateId();
    const connection: Connection = {
      id: connectionId,
      keeperId: invitation.keeperId,
      tellerId: params.tellerId,
      status: 'active',
      invitationCode: params.code,
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    };

    // Store connection
    await kv.set(Keys.connection(connectionId), connection);

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date().toISOString();
    await kv.set(Keys.invitation(params.code), invitation);

    // Add connection to both users' connection lists
    const keeperConnections = await kv.get<string[]>(Keys.userConnections(invitation.keeperId)) || [];
    keeperConnections.push(connectionId);
    await kv.set(Keys.userConnections(invitation.keeperId), keeperConnections);

    const tellerConnections = await kv.get<string[]>(Keys.userConnections(params.tellerId)) || [];
    tellerConnections.push(connectionId);
    await kv.set(Keys.userConnections(params.tellerId), tellerConnections);

    // Initialize empty memories list for connection
    await kv.set(Keys.connectionMemories(connectionId), []);

    return {
      success: true,
      connection,
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's connections
 */
export async function getUserConnections(userId: string) {
  try {
    const connectionIds = await kv.get<string[]>(Keys.userConnections(userId)) || [];

    // Fetch all connections
    const connections = await Promise.all(
      connectionIds.map(id => kv.get<Connection>(Keys.connection(id)))
    );

    // Filter out null connections and get partner profiles
    const connectionsWithProfiles = await Promise.all(
      connections
        .filter((c): c is Connection => c !== null)
        .map(async (connection) => {
          const partnerId = connection.keeperId === userId 
            ? connection.tellerId 
            : connection.keeperId;
          
          const partner = await kv.get<UserProfile>(Keys.user(partnerId));
          
          return {
            connection,
            partner,
          };
        })
    );

    return {
      success: true,
      connections: connectionsWithProfiles,
    };
  } catch (error) {
    console.error('Error getting user connections:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's pending invitations
 */
export async function getUserInvitations(userId: string) {
  try {
    const invitationCodes = await kv.get<string[]>(Keys.userInvitations(userId)) || [];

    // Fetch all invitations
    const invitations = await Promise.all(
      invitationCodes.map(code => kv.get<Invitation>(Keys.invitation(code)))
    );

    // Filter out null invitations
    const validInvitations = invitations.filter((inv): inv is Invitation => inv !== null);

    return {
      success: true,
      invitations: validInvitations,
    };
  } catch (error) {
    console.error('Error getting user invitations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}