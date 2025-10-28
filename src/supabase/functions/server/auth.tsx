/**
 * Adoras Authentication Module
 * 
 * Handles user creation, sign in, sign out, and session management
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { UserProfile, Keys } from './database.tsx';

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Create a new user account (signup)
 */
export async function createUser(params: {
  email: string;
  password: string;
  type: 'keeper' | 'teller';
  name: string;
  phoneNumber?: string;
  relationship?: string;
  bio?: string;
  photo?: string; // Base64 encoded avatar image
  appLanguage?: string;
  birthday?: string;
}) {
  try {
    console.log('📝 Creating user with params:', {
      email: params.email,
      type: params.type,
      name: params.name,
      hasPhoneNumber: !!params.phoneNumber,
      hasRelationship: !!params.relationship,
      hasBio: !!params.bio,
      hasPhoto: !!params.photo,
      hasAppLanguage: !!params.appLanguage,
      hasBirthday: !!params.birthday,
    });

    // Create auth user with Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: params.email,
      password: params.password,
      user_metadata: {
        name: params.name,
        type: params.type,
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (authError) {
      console.log(`⚠️ Auth creation failed: ${authError.message}`);
      // Return error response instead of throwing to provide cleaner error handling
      return {
        success: false,
        error: `Auth creation failed: ${authError.message}`,
      };
    }

    if (!authData.user) {
      console.log('⚠️ User creation failed: No user returned');
      return {
        success: false,
        error: 'User creation failed: No user returned',
      };
    }

    console.log('✅ Supabase Auth user created:', authData.user.id);

    // Create user profile in KV store
    const userProfile: UserProfile = {
      id: authData.user.id,
      type: params.type,
      name: params.name,
      email: params.email,
      phoneNumber: params.phoneNumber,
      relationship: params.relationship,
      bio: params.bio,
      photo: params.photo,
      appLanguage: params.appLanguage as any,
      birthday: params.birthday,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('💾 Saving user profile to KV store:', {
      userId: authData.user.id,
      name: userProfile.name,
      email: userProfile.email,
      type: userProfile.type,
      hasPhoto: !!userProfile.photo,
    });

    const kvKey = Keys.user(authData.user.id);
    console.log('🔑 KV Key:', kvKey);
    
    await kv.set(kvKey, userProfile);

    console.log('✅ User profile saved to KV store');

    // Initialize empty connections list
    await kv.set(Keys.userConnections(authData.user.id), []);

    console.log('✅ User connections initialized');

    // Verify the save by reading it back
    const savedProfile = await kv.get<UserProfile>(kvKey);
    console.log('🔍 Verification - Profile read from KV:', savedProfile ? 'Found' : 'NOT FOUND', savedProfile?.name, 'hasPhoto:', !!savedProfile?.photo);

    return {
      success: true,
      user: userProfile,
      authUserId: authData.user.id,
    };
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign in a user
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in failed:', error.message);
      return {
        success: false,
        error: `Sign in failed: ${error.message}`,
      };
    }

    if (!data.session) {
      console.error('❌ Sign in failed: No session returned');
      return {
        success: false,
        error: 'Sign in failed: No session returned',
      };
    }

    console.log('✅ Auth successful, fetching profile from KV store for user:', data.user.id);

    // Get user profile from KV store
    const kvKey = Keys.user(data.user.id);
    console.log('🔑 Looking up KV Key:', kvKey);
    
    const userProfile = await kv.get<UserProfile>(kvKey);

    if (!userProfile) {
      console.error('❌ User profile not found in KV store for user:', data.user.id);
    } else {
      console.log('✅ User profile found:', {
        name: userProfile.name,
        email: userProfile.email,
        type: userProfile.type,
      });
    }

    return {
      success: true,
      accessToken: data.session.access_token,
      user: userProfile,
    };
  } catch (error) {
    console.error('❌ Error signing in:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sign out a user
 */
export async function signOut(accessToken: string) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current user from access token
 */
export async function getCurrentUser(accessToken: string) {
  try {
    // Handle empty or invalid token format
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      return {
        success: false,
        error: 'No valid access token provided',
      };
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      // Handle specific JWT errors more gracefully
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('invalid claim') || errorMessage.includes('missing sub')) {
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      }
      return {
        success: false,
        error: `Get user failed: ${error.message}`,
      };
    }

    if (!user || !user.id) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Get user profile from KV store
    const userProfile = await kv.get<UserProfile>(Keys.user(user.id));

    return {
      success: true,
      user: userProfile,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    // Catch any unexpected errors from Supabase JWT parsing
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.toLowerCase().includes('invalid claim') || 
        errorMessage.toLowerCase().includes('missing sub') ||
        errorMessage.toLowerCase().includes('jwt')) {
      return {
        success: false,
        error: 'Invalid or malformed token',
      };
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    // Get existing profile
    const existingProfile = await kv.get<UserProfile>(Keys.user(userId));

    if (!existingProfile) {
      throw new Error('User profile not found');
    }

    // Merge updates with existing profile
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updates,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    // Save updated profile
    await kv.set(Keys.user(userId), updatedProfile);

    return {
      success: true,
      user: updatedProfile,
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify access token and return user ID
 */
export async function verifyToken(accessToken: string) {
  try {
    // Handle empty or invalid token format
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      console.log('⚠️ verifyToken: No valid access token provided');
      return {
        success: false,
        error: 'No valid access token provided',
      };
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      // Handle specific JWT errors more gracefully
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('invalid claim') || errorMessage.includes('missing sub')) {
        console.log('⚠️ verifyToken: Invalid or expired token (JWT parsing failed)');
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      }
      console.error('❌ verifyToken: Token verification failed:', error.message);
      return {
        success: false,
        error: `Token verification failed: ${error.message}`,
      };
    }

    if (!user || !user.id) {
      console.log('⚠️ verifyToken: No user found in token');
      return {
        success: false,
        error: 'Invalid token: user not found',
      };
    }

    console.log('✅ verifyToken: Token verified successfully for user:', user.id);
    return {
      success: true,
      userId: user.id,
    };
  } catch (error) {
    console.error('❌ verifyToken: Unexpected error:', error);
    // Catch any unexpected errors from Supabase JWT parsing
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.toLowerCase().includes('invalid claim') || 
        errorMessage.toLowerCase().includes('missing sub') ||
        errorMessage.toLowerCase().includes('jwt')) {
      console.log('⚠️ verifyToken: JWT parsing exception caught');
      return {
        success: false,
        error: 'Invalid or malformed token',
      };
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}