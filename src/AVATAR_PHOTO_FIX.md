# Avatar Photo Storage Fix

## Issue
Avatar photos uploaded during onboarding were not persisting after signup completion. Users would upload photos during the KeeperOnboarding or TellerOnboarding flows, but after completing registration, their avatars would default to blank/empty.

## Root Cause
The `photo` field was being collected in the frontend and passed to the signup API, but it was being silently dropped by the backend because:

1. **Frontend → Backend Communication**: The frontend was correctly sending the `photo` field (base64 encoded) in the signup request
2. **Backend Route Handler**: The signup route in `/supabase/functions/server/index.tsx` was NOT extracting the `photo` field from the request body
3. **Auth Function**: The `createUser` function in `/supabase/functions/server/auth.tsx` did NOT have `photo` as a parameter
4. **Database**: The photo was never being saved to the user profile in the KV store

## Solution
Fixed the complete data flow by updating three files:

### 1. Frontend Types (`/utils/api/types.ts`)
Added `photo` field to the `SignupRequest` interface:
```typescript
export interface SignupRequest {
  email: string;
  password: string;
  type: 'keeper' | 'teller';
  name: string;
  phoneNumber?: string;
  relationship?: string;
  bio?: string;
  photo?: string; // Base64 encoded avatar image ✅ ADDED
  appLanguage?: string;
  birthday?: string;
}
```

### 2. Backend Route Handler (`/supabase/functions/server/index.tsx`)
Updated the signup route to extract and pass the `photo` field:
```typescript
app.post("/make-server-deded1eb/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, type, name, phoneNumber, relationship, bio, photo, appLanguage, birthday } = body;
    //                                                                           ^^^^^ ADDED
    
    const result = await auth.createUser({
      email,
      password,
      type,
      name,
      phoneNumber,
      relationship,
      bio,
      photo, // ✅ ADDED
      appLanguage,
      birthday,
    });
    // ...
  }
});
```

### 3. Auth Function (`/supabase/functions/server/auth.tsx`)
Added `photo` parameter to `createUser` function and included it when creating the UserProfile:
```typescript
export async function createUser(params: {
  email: string;
  password: string;
  type: 'keeper' | 'teller';
  name: string;
  phoneNumber?: string;
  relationship?: string;
  bio?: string;
  photo?: string; // Base64 encoded avatar image ✅ ADDED
  appLanguage?: string;
  birthday?: string;
}) {
  // ...
  
  const userProfile: UserProfile = {
    id: authData.user.id,
    type: params.type,
    name: params.name,
    email: params.email,
    phoneNumber: params.phoneNumber,
    relationship: params.relationship,
    bio: params.bio,
    photo: params.photo, // ✅ ADDED
    appLanguage: params.appLanguage as any,
    birthday: params.birthday,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Added logging to verify photo is present
  console.log('💾 Saving user profile to KV store:', {
    userId: authData.user.id,
    name: userProfile.name,
    email: userProfile.email,
    type: userProfile.type,
    hasPhoto: !!userProfile.photo, // ✅ ADDED
  });
  
  // ...
}
```

## How Photos Are Stored

### Avatar Photos (Current Implementation)
- **Format**: Base64 encoded data URLs (e.g., `data:image/jpeg;base64,/9j/4AAQ...`)
- **Processing**: Images are cropped using the AvatarCropper component before being converted to base64
- **Storage**: Stored directly in the user profile in the KV store
- **Benefits**: 
  - Simple to implement - no separate file storage needed
  - No URL expiration issues
  - Works offline once loaded
- **Considerations**: 
  - Base64 increases size by ~33%
  - Suitable for avatars (small images)
  - User profile size increases with photo

### Memory Photos (For Comparison)
- **Format**: Files uploaded to Supabase Storage
- **Storage**: Stored in `make-deded1eb-adoras-media` bucket
- **Access**: Via signed URLs (expire after 1 hour)
- **Path Structure**: `{connectionId}/{userId}/{timestamp}-{filename}`

## Verification
The fix includes enhanced logging to verify photo persistence:
- Before save: Logs `hasPhoto: true/false`
- After save: Reads back from KV store and logs `hasPhoto: true/false`

Check server logs during signup to verify photos are being saved correctly.

## Testing
To verify the fix works:
1. Create a new user account (Keeper or Teller)
2. Upload an avatar photo during onboarding
3. Complete the signup process
4. Log out and log back in
5. Avatar should persist and display correctly on:
   - Dashboard header
   - Account Settings
   - Chat messages
   - Connection cards

## Related Files
- `/components/KeeperOnboarding.tsx` - Handles Keeper avatar upload with cropping
- `/components/TellerOnboarding.tsx` - Handles Teller avatar upload (if applicable)
- `/components/AvatarCropper.tsx` - Provides image cropping functionality
- `/components/Dashboard.tsx` - Displays user avatar
- `/components/ChatTab.tsx` - Shows avatars in chat messages
- `/components/AccountSettings.tsx` - Allows avatar updates

## Status
✅ **FIXED** - Avatar photos now properly persist through the entire signup and login flow.
