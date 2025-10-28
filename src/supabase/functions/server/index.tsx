import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as auth from "./auth.tsx";
import * as invitations from "./invitations.tsx";
import * as memories from "./memories.tsx";
import ai from "./ai.tsx";
import notifications from "./notifications.tsx";
import icons from "./icons.tsx";
import * as testSetup from "./setup_test_invitation.tsx";

// Adoras Server - Ultra-responsive scroll detection update
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage on startup
memories.initializeStorage();

// Health check endpoint
app.get("/make-server-deded1eb/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test signin endpoint - returns detailed diagnostics
app.post("/make-server-deded1eb/test/signin-diagnostic", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      email: email,
      supabaseUrl: Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      serviceRoleKeyLength: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length || 0,
    };
    
    return c.json({ success: true, diagnostics });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// ============================================================================
// ICON ROUTES (PWA Touch Icons)
// ============================================================================

// Mount icon routes
app.route("/", icons);

// ============================================================================
// AI ROUTES (Phase 4a, 4b, 4c)
// ============================================================================

// Mount AI routes
app.route("/", ai);

// ============================================================================
// NOTIFICATION ROUTES (Phase 4d)
// ============================================================================

// Mount notification routes
app.route("/", notifications);

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /make-server-deded1eb/auth/signup
 * Create a new user account
 */
app.post("/make-server-deded1eb/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, type, name, phoneNumber, relationship, bio, photo, appLanguage, birthday } = body;

    if (!email || !password || !type || !name) {
      return c.json({ success: false, error: "Missing required fields" }, 400);
    }

    const result = await auth.createUser({
      email,
      password,
      type,
      name,
      phoneNumber,
      relationship,
      bio,
      photo,
      appLanguage,
      birthday,
    });

    return c.json(result, result.success ? 201 : 400);
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Signup failed" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/auth/signin
 * Sign in a user
 */
app.post("/make-server-deded1eb/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ success: false, error: "Missing email or password" }, 400);
    }

    const result = await auth.signIn(email, password);
    return c.json(result, result.success ? 200 : 401);
  } catch (error) {
    console.error("Signin error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Signin failed" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/auth/signout
 * Sign out a user
 */
app.post("/make-server-deded1eb/auth/signout", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "No access token provided" }, 401);
    }

    const result = await auth.signOut(accessToken);
    return c.json(result);
  } catch (error) {
    console.error("Signout error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Signout failed" 
    }, 500);
  }
});

/**
 * GET /make-server-deded1eb/auth/me
 * Get current user profile
 */
app.get("/make-server-deded1eb/auth/me", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "No access token provided" }, 401);
    }

    const result = await auth.getCurrentUser(accessToken);
    return c.json(result, result.success ? 200 : 401);
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get user" 
    }, 500);
  }
});

/**
 * PUT /make-server-deded1eb/auth/profile
 * Update user profile
 */
app.put("/make-server-deded1eb/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const result = await auth.updateProfile(verifyResult.userId, body);
    
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Update failed" 
    }, 500);
  }
});

// ============================================================================
// INVITATION & CONNECTION ROUTES
// ============================================================================

/**
 * POST /make-server-deded1eb/invitations/create
 * Create and send SMS invitation with pre-filled storyteller info
 */
app.post("/make-server-deded1eb/invitations/create", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { tellerPhoneNumber, tellerName, tellerBirthday, tellerRelationship, tellerBio, tellerPhoto, code } = body;

    if (!tellerPhoneNumber) {
      return c.json({ success: false, error: "Missing phone number" }, 400);
    }

    const result = await invitations.createInvitation({
      keeperId: verifyResult.userId,
      tellerPhoneNumber,
      tellerName,
      tellerBirthday,
      tellerRelationship,
      tellerBio,
      tellerPhoto,
      code,
    });

    return c.json(result, result.success ? 201 : 400);
  } catch (error) {
    console.error("Create invitation error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create invitation" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/invitations/verify
 * Verify invitation code
 */
app.post("/make-server-deded1eb/invitations/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { code } = body;

    if (!code) {
      return c.json({ success: false, error: "Missing invitation code" }, 400);
    }

    const result = await invitations.verifyInvitationCode(code);
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Verify invitation error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to verify invitation" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/invitations/accept
 * Accept invitation and create connection
 */
app.post("/make-server-deded1eb/invitations/accept", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { code } = body;

    if (!code) {
      return c.json({ success: false, error: "Missing invitation code" }, 400);
    }

    const result = await invitations.acceptInvitation({
      code,
      tellerId: verifyResult.userId,
    });

    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Accept invitation error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to accept invitation" 
    }, 500);
  }
});

/**
 * GET /make-server-deded1eb/connections
 * Get user's connections
 */
app.get("/make-server-deded1eb/connections", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const result = await invitations.getUserConnections(verifyResult.userId);
    return c.json(result);
  } catch (error) {
    console.error("Get connections error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get connections" 
    }, 500);
  }
});

/**
 * GET /make-server-deded1eb/invitations
 * Get user's pending invitations
 */
app.get("/make-server-deded1eb/invitations", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const result = await invitations.getUserInvitations(verifyResult.userId);
    return c.json(result);
  } catch (error) {
    console.error("Get invitations error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get invitations" 
    }, 500);
  }
});

// ============================================================================
// MEMORY ROUTES
// ============================================================================

/**
 * POST /make-server-deded1eb/memories
 * Create a new memory
 */
app.post("/make-server-deded1eb/memories", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const result = await memories.createMemory({
      userId: verifyResult.userId,
      ...body,
    });

    return c.json(result, result.success ? 201 : 400);
  } catch (error) {
    console.error("Create memory error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create memory" 
    }, 500);
  }
});

/**
 * GET /make-server-deded1eb/memories/:connectionId
 * Get memories for a connection
 */
app.get("/make-server-deded1eb/memories/:connectionId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const connectionId = c.req.param("connectionId");
    const result = await memories.getConnectionMemories({
      connectionId,
      userId: verifyResult.userId,
    });

    return c.json(result);
  } catch (error) {
    console.error("Get memories error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get memories" 
    }, 500);
  }
});

/**
 * PUT /make-server-deded1eb/memories/:memoryId
 * Update a memory (Legacy Keeper only)
 */
app.put("/make-server-deded1eb/memories/:memoryId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const memoryId = c.req.param("memoryId");
    const body = await c.req.json();

    const result = await memories.updateMemory({
      memoryId,
      userId: verifyResult.userId,
      updates: body,
    });

    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Update memory error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update memory" 
    }, 500);
  }
});

/**
 * DELETE /make-server-deded1eb/memories/:memoryId
 * Delete a memory (Legacy Keeper only)
 */
app.delete("/make-server-deded1eb/memories/:memoryId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const memoryId = c.req.param("memoryId");

    const result = await memories.deleteMemory({
      memoryId,
      userId: verifyResult.userId,
    });

    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Delete memory error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete memory" 
    }, 500);
  }
});

/**
 * GET /make-server-deded1eb/memory/:memoryId
 * Get a single memory
 */
app.get("/make-server-deded1eb/memory/:memoryId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const memoryId = c.req.param("memoryId");

    const result = await memories.getMemory({
      memoryId,
      userId: verifyResult.userId,
    });

    return c.json(result);
  } catch (error) {
    console.error("Get memory error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get memory" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/memories/:memoryId/refresh-url
 * Refresh signed URLs for a memory's media files (Phase 3b)
 */
app.post("/make-server-deded1eb/memories/:memoryId/refresh-url", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const memoryId = c.req.param("memoryId");

    const result = await memories.refreshMemoryUrls({
      memoryId,
      userId: verifyResult.userId,
    });

    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Refresh memory URL error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to refresh memory URL" 
    }, 500);
  }
});

// ============================================================================
// STORAGE/UPLOAD ROUTES
// ============================================================================

/**
 * POST /make-server-deded1eb/upload
 * Upload a file to Supabase Storage (bypasses RLS with service role key)
 */
app.post("/make-server-deded1eb/upload", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const connectionId = formData.get('connectionId') as string;
    const fileName = formData.get('fileName') as string;

    if (!file || !connectionId || !fileName) {
      return c.json({ 
        success: false, 
        error: "Missing required fields: file, connectionId, fileName" 
      }, 400);
    }

    // Upload file using backend service
    const uploadResult = await memories.uploadFile({
      userId: verifyResult.userId,
      connectionId,
      file,
      fileName,
      contentType: file.type,
    });

    if (!uploadResult.success) {
      return c.json(uploadResult, 400);
    }

    // Get public URL for the uploaded file (bucket is public for AI access)
    const publicUrlResult = await memories.getPublicUrl(uploadResult.path!);

    if (!publicUrlResult.success) {
      return c.json({ 
        success: false, 
        error: "File uploaded but failed to generate public URL" 
      }, 500);
    }

    return c.json({
      success: true,
      url: publicUrlResult.url,
      path: uploadResult.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to upload file" 
    }, 500);
  }
});

/**
 * GET /make-server-deded1eb/storage/stats
 * Get storage usage statistics for a user
 */
app.get("/make-server-deded1eb/storage/stats", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const verifyResult = await auth.verifyToken(accessToken);
    if (!verifyResult.success || !verifyResult.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    // Get storage statistics
    const stats = await memories.getStorageStats(verifyResult.userId);
    
    return c.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error("Storage stats error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get storage stats" 
    }, 500);
  }
});

// ============================================================================
// TEST & DEBUG ROUTES
// ============================================================================

/**
 * POST /make-server-deded1eb/test/setup-invitation
 * Setup test invitation TESTCODE for Shane and Allison
 */
app.post("/make-server-deded1eb/test/setup-invitation", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const result = await testSetup.setupTestInvitation(body);
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Setup test invitation error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to setup invitation" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/test/reset-invitation
 * Reset test invitation TESTCODE (delete connection and invitation)
 */
app.post("/make-server-deded1eb/test/reset-invitation", async (c) => {
  try {
    const result = await testSetup.resetTestInvitation();
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Reset test invitation error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to reset invitation" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/test/delete-user
 * Completely delete a user and all their data (for testing)
 */
app.post("/make-server-deded1eb/test/delete-user", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    if (!email) {
      return c.json({ success: false, error: 'Email is required' }, 400);
    }
    
    const result = await testSetup.deleteUser(email);
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete user" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/test/cleanup-fix-invitation
 * Clean up test keeper and fix TESTCODE to link with Shane Long
 */
app.post("/make-server-deded1eb/test/cleanup-fix-invitation", async (c) => {
  try {
    const result = await testSetup.cleanupAndFixTestInvitation();
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Cleanup and fix invitation error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to cleanup and fix invitation" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/test/ensure-connected
 * Ensure Shane and Allison are connected for testing
 */
app.post("/make-server-deded1eb/test/ensure-connected", async (c) => {
  try {
    const result = await testSetup.ensureTestUsersConnected();
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Ensure test users connected error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to ensure users connected" 
    }, 500);
  }
});

/**
 * POST /make-server-deded1eb/test/cleanup-connect-shane-allison
 * Clean up all connections and create a fresh direct connection between Shane and Allison
 * Removes any test keeper users and incorrect connections
 */
app.post("/make-server-deded1eb/test/cleanup-connect-shane-allison", async (c) => {
  try {
    const result = await testSetup.cleanUpAndConnectShaneAllison();
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Cleanup and connect Shane-Allison error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to cleanup and connect users" 
    }, 500);
  }
});

/**
 * GET /make-server-deded1eb/test/check-connection
 * Check connection status between Shane and Allison
 */
app.get("/make-server-deded1eb/test/check-connection", async (c) => {
  try {
    const result = await testSetup.checkConnection();
    return c.json(result, result.success ? 200 : 400);
  } catch (error) {
    console.error("Check connection error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to check connection" 
    }, 500);
  }
});

Deno.serve(app.fetch);