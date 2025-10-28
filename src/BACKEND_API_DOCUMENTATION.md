# 🚀 Adoras Backend API Documentation

## ✅ Phase 1: Complete - Database & Authentication

**Backend Infrastructure Status:** LIVE ✅

---

## 📚 Table of Contents

1. [Server Info](#server-info)
2. [Authentication](#authentication)
3. [Invitations & Connections](#invitations--connections)
4. [Memories](#memories)
5. [Storage](#storage)
6. [Error Handling](#error-handling)
7. [Next Steps](#next-steps)

---

## 🌐 Server Info

**Base URL:** `https://${projectId}.supabase.co/functions/v1/make-server-deded1eb`

**Import credentials:**
```typescript
import { projectId, publicAnonKey } from './utils/supabase/info';
```

**Health Check:**
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T10:00:00.000Z"
}
```

---

## 🔐 Authentication

### Signup (Create Account)

**Endpoint:** `POST /auth/signup`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer ${publicAnonKey}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "type": "keeper",  // or "teller"
  "name": "John Doe",
  "phoneNumber": "+1234567890",  // optional
  "relationship": "Son",  // optional
  "bio": "College student",  // optional
  "appLanguage": "english",  // optional
  "birthday": "1990-05-15"  // optional, ISO date
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id-here",
    "type": "keeper",
    "name": "John Doe",
    "email": "user@example.com",
    ...
  },
  "authUserId": "supabase-auth-id"
}
```

---

### Sign In

**Endpoint:** `POST /auth/signin`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    ...
  }
}
```

**Usage:** Store `accessToken` and use it in subsequent requests:
```typescript
const token = response.accessToken;
// Use in Authorization header
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

### Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer ${accessToken}
```

**Response:**
```json
{
  "success": true,
  "userId": "user-id",
  "user": {
    "id": "user-id",
    "type": "keeper",
    "name": "John Doe",
    ...
  }
}
```

---

### Update Profile

**Endpoint:** `PUT /auth/profile`

**Headers:**
```
Authorization: Bearer ${accessToken}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "photo": "url-to-photo",
  "phoneNumber": "+1234567890",
  "appLanguage": "spanish"
}
```

---

### Sign Out

**Endpoint:** `POST /auth/signout`

**Headers:**
```
Authorization: Bearer ${accessToken}
```

**Response:**
```json
{
  "success": true
}
```

---

## 📧 Invitations & Connections

### Create Invitation (Send SMS)

**Endpoint:** `POST /invitations/create`

**Headers:**
```
Authorization: Bearer ${accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "tellerPhoneNumber": "+1234567890",
  "tellerName": "Mom"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "invitation": {
    "id": "invitation-id",
    "code": "123456",  // 6-digit code
    "keeperId": "keeper-user-id",
    "tellerPhoneNumber": "+1234567890",
    "status": "sent",
    "sentAt": "2025-10-23T10:00:00.000Z",
    "expiresAt": "2025-10-30T10:00:00.000Z"  // 7 days
  },
  "smsSent": true,  // false if Twilio not configured
  "smsError": null  // error message if SMS failed
}
```

**SMS Configuration:**
- Requires Twilio credentials as environment variables:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- If not configured, invitation is created but SMS is not sent
- User can manually share the code

**SMS Message Template:**
```
{keeperName} invited you to share memories on Adoras! 📸

Your code: 123456

Download: https://whole-works-409347.framer.app/
```

---

### Verify Invitation Code

**Endpoint:** `POST /invitations/verify`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer ${publicAnonKey}
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "invitation": {
    "id": "invitation-id",
    "code": "123456",
    "keeperId": "keeper-user-id",
    ...
  },
  "keeper": {
    "id": "keeper-user-id",
    "name": "John Doe",
    "relationship": "Son",
    ...
  }
}
```

---

### Accept Invitation

**Endpoint:** `POST /invitations/accept`

**Headers:**
```
Authorization: Bearer ${accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "connection": {
    "id": "connection-id",
    "keeperId": "keeper-user-id",
    "tellerId": "teller-user-id",
    "status": "active",
    "createdAt": "2025-10-23T10:00:00.000Z",
    "acceptedAt": "2025-10-23T10:05:00.000Z"
  }
}
```

---

### Get User Connections

**Endpoint:** `GET /connections`

**Headers:**
```
Authorization: Bearer ${accessToken}
```

**Response:**
```json
{
  "success": true,
  "connections": [
    {
      "connection": {
        "id": "connection-id",
        "keeperId": "keeper-id",
        "tellerId": "teller-id",
        "status": "active",
        ...
      },
      "partner": {
        "id": "partner-id",
        "name": "Mom",
        "relationship": "Mother",
        ...
      }
    }
  ]
}
```

---

### Get Pending Invitations

**Endpoint:** `GET /invitations`

**Headers:**
```
Authorization: Bearer ${accessToken}
```

**Response:**
```json
{
  "success": true,
  "invitations": [
    {
      "id": "invitation-id",
      "code": "123456",
      "status": "sent",
      "tellerPhoneNumber": "+1234567890",
      "sentAt": "2025-10-23T10:00:00.000Z",
      ...
    }
  ]
}
```

---

## 💭 Memories

### Create Memory

**Endpoint:** `POST /memories`

**Headers:**
```
Authorization: Bearer ${accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "connectionId": "connection-id",
  "type": "text",  // text | photo | voice | video | document
  "content": "Remember that fishing trip?",
  "sender": "keeper",  // keeper | teller
  "category": "Chat",  // optional
  "tags": ["memory", "family"],  // optional
  "estimatedDate": "2015-06-01",  // optional
  "location": "Lake Tahoe",  // optional
  "notes": "Admin notes",  // optional
  "promptQuestion": "What's your favorite memory?"  // optional
}
```

**For Voice Memories:**
```json
{
  ...baseFields,
  "type": "voice",
  "audioUrl": "storage-path-or-url",
  "transcript": "Transcribed text",
  "originalText": "Original non-English text",
  "voiceLanguage": "Spanish",
  "englishTranslation": "English translation"
}
```

**For Photo Memories:**
```json
{
  ...baseFields,
  "type": "photo",
  "photoUrl": "storage-path-or-url",
  "photoLocation": "Paris, France",
  "photoGPSCoordinates": { "latitude": 48.8566, "longitude": 2.3522 },
  "detectedPeople": ["Mom", "Dad"],
  "detectedFaces": 2
}
```

**Response:**
```json
{
  "success": true,
  "memory": {
    "id": "memory-id",
    "userId": "creator-id",
    "connectionId": "connection-id",
    "type": "text",
    "content": "...",
    "timestamp": "2025-10-23T10:00:00.000Z",
    "createdAt": "2025-10-23T10:00:00.000Z",
    ...
  }
}
```

---

### Get Connection Memories

**Endpoint:** `GET /memories/:connectionId`

**Headers:**
```
Authorization: Bearer ${accessToken}
```

**Response:**
```json
{
  "success": true,
  "memories": [
    {
      "id": "memory-id",
      "type": "text",
      "content": "...",
      "sender": "keeper",
      "timestamp": "2025-10-23T10:00:00.000Z",
      ...
    }
  ]
}
```

**Note:** Memories are sorted by timestamp (newest first)

---

### Update Memory (Legacy Keeper Only)

**Endpoint:** `PUT /memories/:memoryId`

**Headers:**
```
Authorization: Bearer ${accessToken}
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "notes": "Updated admin notes",
  "category": "Updated Category",
  "tags": ["updated", "tags"],
  "estimatedDate": "2015-07-01",
  "location": "Updated Location"
}
```

**Response:**
```json
{
  "success": true,
  "memory": {
    "id": "memory-id",
    ...updatedFields,
    "updatedAt": "2025-10-23T10:10:00.000Z"
  }
}
```

**Authorization:** Only the Legacy Keeper (connection.keeperId) can edit memories

---

### Delete Memory (Legacy Keeper Only)

**Endpoint:** `DELETE /memories/:memoryId`

**Headers:**
```
Authorization: Bearer ${accessToken}
```

**Response:**
```json
{
  "success": true
}
```

**Authorization:** Only the Legacy Keeper can delete memories

---

### Get Single Memory

**Endpoint:** `GET /memory/:memoryId`

**Headers:**
```
Authorization: Bearer ${accessToken}
```

**Response:**
```json
{
  "success": true,
  "memory": {
    "id": "memory-id",
    ...
  }
}
```

---

## 📦 Storage

### Supabase Storage Bucket

**Bucket Name:** `make-deded1eb-adoras-media`

**Status:** Private (requires authentication)

**Auto-initialized:** Yes (created on server startup)

**File Upload Pattern:**
```
{connectionId}/{userId}/{timestamp}-{filename}
```

**Example:**
```
conn-123/user-456/1698765432000-photo.jpg
```

### Uploading Files

Files should be uploaded to Supabase Storage using the Supabase client in the frontend:

```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Upload file
const file = /* File from input */;
const filePath = `${connectionId}/${userId}/${Date.now()}-${file.name}`;

const { data, error } = await supabase.storage
  .from('make-deded1eb-adoras-media')
  .upload(filePath, file, {
    contentType: file.type
  });

// Get signed URL
const { data: urlData } = await supabase.storage
  .from('make-deded1eb-adoras-media')
  .createSignedUrl(filePath, 3600); // 1 hour

// Use urlData.signedUrl in memory creation
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid access token
- **500 Internal Server Error** - Server error

### Common Error Messages

**Authentication:**
- "Missing required fields"
- "Invalid or expired token"
- "User profile not found"
- "Sign in failed: Invalid credentials"

**Invitations:**
- "Invalid phone number format"
- "Invitation code not found"
- "Invitation code has expired"
- "Invitation code has already been used"

**Memories:**
- "Connection not found"
- "User not authorized for this connection"
- "Only Legacy Keepers can edit memories"
- "Memory not found"

**General:**
- "Unauthorized"
- "SMS service not configured"

---

## 🔄 Next Steps (Phases 2-5)

### Phase 2: SMS Integration ⏳
- Configure Twilio credentials
- Test SMS delivery
- Add phone number validation
- Handle SMS failures gracefully

### Phase 3: Real-time Sync 🔜
- WebSocket connections
- Live memory updates
- Presence indicators
- Typing indicators in chat

### Phase 4: AI Integration 🔜
- Document transcription (OCR)
- Voice transcription
- Intelligent categorization
- Auto-tagging
- Date extraction
- Location extraction

### Phase 5: Push Notifications 🔜
- Daily prompt delivery
- New memory notifications
- Connection request alerts
- FCM/APNS integration

---

## 📝 Usage Example: Complete Flow

```typescript
import { projectId, publicAnonKey } from './utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-deded1eb`;

// 1. KEEPER SIGNUP
const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'keeper@example.com',
    password: 'securepass',
    type: 'keeper',
    name: 'John (Keeper)'
  })
});
const { user: keeper } = await signupResponse.json();

// 2. KEEPER SIGNIN
const signinResponse = await fetch(`${BASE_URL}/auth/signin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'keeper@example.com',
    password: 'securepass'
  })
});
const { accessToken: keeperToken } = await signinResponse.json();

// 3. SEND INVITATION
const inviteResponse = await fetch(`${BASE_URL}/invitations/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${keeperToken}`
  },
  body: JSON.stringify({
    tellerPhoneNumber: '+1234567890',
    tellerName: 'Mom'
  })
});
const { invitation } = await inviteResponse.json();
const inviteCode = invitation.code; // "123456"

// 4. TELLER SIGNUP
const tellerSignupResponse = await fetch(`${BASE_URL}/auth/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'teller@example.com',
    password: 'securepass',
    type: 'teller',
    name: 'Mom (Teller)'
  })
});

// 5. TELLER SIGNIN
const tellerSigninResponse = await fetch(`${BASE_URL}/auth/signin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`
  },
  body: JSON.stringify({
    email: 'teller@example.com',
    password: 'securepass'
  })
});
const { accessToken: tellerToken } = await tellerSigninResponse.json();

// 6. ACCEPT INVITATION
const acceptResponse = await fetch(`${BASE_URL}/invitations/accept`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tellerToken}`
  },
  body: JSON.stringify({
    code: inviteCode
  })
});
const { connection } = await acceptResponse.json();
const connectionId = connection.id;

// 7. CREATE MEMORY
const memoryResponse = await fetch(`${BASE_URL}/memories`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tellerToken}`
  },
  body: JSON.stringify({
    connectionId: connectionId,
    type: 'text',
    content: 'Remember when you were little and we went fishing?',
    sender: 'teller',
    category: 'Childhood',
    tags: ['fishing', 'family']
  })
});
const { memory } = await memoryResponse.json();

// 8. GET MEMORIES
const memoriesResponse = await fetch(
  `${BASE_URL}/memories/${connectionId}`,
  {
    headers: {
      'Authorization': `Bearer ${keeperToken}`
    }
  }
);
const { memories } = await memoriesResponse.json();

console.log('All memories:', memories);
```

---

## 🎉 Summary

**✅ Phase 1 Complete!**

You now have:
- **Authentication system** with Supabase Auth
- **User profiles** with keeper/teller roles
- **SMS invitation system** with Twilio integration ready
- **Multi-user connections** with relationship tracking
- **Memory storage** with full CRUD operations
- **Cloud storage** for media files
- **Row-level security** via connection validation
- **Complete REST API** for all operations

**Next:** We'll integrate this backend with your frontend components and implement real-time sync!
