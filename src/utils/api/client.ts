/**
 * Adoras API Client
 * Handles all communication with the Supabase backend
 */

import { projectId, publicAnonKey } from '../supabase/info';
import { pwaInstaller } from '../pwaInstaller';
import type {
  SignupRequest,
  SignupResponse,
  SignInRequest,
  SignInResponse,
  VerifyTokenResponse,
  CreateInvitationRequest,
  CreateInvitationResponse,
  VerifyInvitationResponse,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  GetConnectionsResponse,
  GetInvitationsResponse,
  CreateMemoryRequest,
  CreateMemoryResponse,
  GetMemoriesResponse,
  GetMemoryResponse,
  UpdateMemoryRequest,
  UpdateMemoryResponse,
  DeleteMemoryResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from './types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-deded1eb`;

/**
 * API Client Class
 */
class AdorasAPIClient {
  private accessToken: string | null = null;
  private useSessionStorage: boolean = false;

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(token: string | null, rememberMe: boolean = true) {
    this.accessToken = token;
    this.useSessionStorage = !rememberMe;
    
    if (token) {
      if (rememberMe) {
        localStorage.setItem('adoras_access_token', token);
        sessionStorage.removeItem('adoras_access_token');
      } else {
        sessionStorage.setItem('adoras_access_token', token);
        localStorage.removeItem('adoras_access_token');
      }
    } else {
      localStorage.removeItem('adoras_access_token');
      sessionStorage.removeItem('adoras_access_token');
    }
  }

  /**
   * Get access token from memory or localStorage/sessionStorage
   */
  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }
    
    // Check sessionStorage first (for current session)
    let token = sessionStorage.getItem('adoras_access_token');
    if (token) {
      this.accessToken = token;
      this.useSessionStorage = true;
      return token;
    }
    
    // Check localStorage (for remembered sessions)
    token = localStorage.getItem('adoras_access_token');
    if (token) {
      this.accessToken = token;
      this.useSessionStorage = false;
      return token;
    }
    
    return null;
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    const token = this.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // For endpoints that don't require auth (like signup), use the public anon key
    // For authenticated endpoints, use the user's access token
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (!requiresAuth) {
      // For public endpoints (signup), use the public anon key for Supabase edge functions
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    const fullUrl = `${BASE_URL}${endpoint}`;

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`);
      
      // Add timeout to prevent hanging requests (10 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error [${endpoint}]:`, JSON.stringify(data, null, 2));
        console.error(`❌ Full URL:`, fullUrl);
        console.error(`❌ Status:`, response.status, response.statusText);
        console.error(`❌ Headers sent:`, {
          'Content-Type': headers['Content-Type'],
          'Authorization': headers['Authorization'] ? 'Bearer [TOKEN]' : 'NONE',
        });
      }

      return data as T;
    } catch (error) {
      console.error(`💥 Network Error [${endpoint}]:`, error);
      console.error(`💥 Full URL:`, fullUrl);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - server not responding');
        } else if (error.message.includes('fetch')) {
          throw new Error('Cannot connect to server - edge function may not be deployed');
        }
      }
      
      throw error;
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await this.request<SignupResponse>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false // Signup doesn't require authentication
    );

    return response;
  }

  /**
   * Sign in a user
   */
  async signin(data: SignInRequest, rememberMe: boolean = true): Promise<SignInResponse> {
    try {
      // Signin is a public endpoint - don't require auth
      const response = await this.request<any>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(data),
      }, false); // false = no auth required

      console.log('🔍 Signin response:', JSON.stringify(response, null, 2));

      if (response.success && response.accessToken) {
        this.setAccessToken(response.accessToken, rememberMe);
      }

      return response as SignInResponse;
    } catch (error) {
      // CHROME WORKAROUND: If we get auth error or network error, try direct Supabase auth
      console.warn('⚠️ Server signin failed, attempting direct Supabase auth fallback...', error);
      
      try {
        // Import Supabase client dynamically
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          `https://${projectId}.supabase.co`,
          publicAnonKey
        );
        
        console.log('🔐 Attempting direct Supabase auth with email:', data.email);
        
        // Try direct Supabase auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (authError) {
          console.error('❌ Direct Supabase auth failed:', authError);
          return {
            success: false,
            error: `Sign in failed: ${authError.message}`,
          };
        }
        
        if (!authData.session) {
          console.error('❌ No session returned from Supabase auth');
          return {
            success: false,
            error: 'Sign in failed: No session returned',
          };
        }
        
        console.log('✅ Direct Supabase auth succeeded! Token:', authData.session.access_token.substring(0, 20) + '...');
        
        // Set the access token
        this.setAccessToken(authData.session.access_token, rememberMe);
        
        // Try to get user profile from our server
        try {
          console.log('📡 Fetching user profile from server...');
          const userResponse = await this.getCurrentUser();
          console.log('👤 User profile response:', userResponse);
          
          if (userResponse.success && userResponse.user) {
            console.log('✅ Successfully fetched user profile from server');
            return {
              success: true,
              accessToken: authData.session.access_token,
              user: userResponse.user,
            };
          }
        } catch (profileError) {
          console.error('⚠️ Failed to fetch profile from server, but auth succeeded:', profileError);
        }
        
        // If we can't get profile from server, return minimal success
        console.log('⚠️ Using minimal profile from email');
        return {
          success: true,
          accessToken: authData.session.access_token,
          user: {
            name: authData.user.email?.split('@')[0] || 'User',
            email: authData.user.email || '',
            type: 'keeper', // Default
            relationship: '',
            bio: '',
          },
        };
      } catch (fallbackError) {
        console.error('❌ Direct Supabase auth fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }
  }

  /**
   * Sign out current user
   */
  async signout(): Promise<{ success: boolean; error?: string }> {
    const response = await this.request<{ success: boolean; error?: string }>(
      '/auth/signout',
      {
        method: 'POST',
      }
    );

    if (response.success) {
      this.setAccessToken(null);
    }

    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<VerifyTokenResponse> {
    return this.request<VerifyTokenResponse>('/auth/me', {
      method: 'GET',
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return this.request<UpdateProfileResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // INVITATIONS & CONNECTIONS
  // ============================================================================

  /**
   * Create and send invitation
   */
  async createInvitation(
    data: CreateInvitationRequest
  ): Promise<CreateInvitationResponse> {
    return this.request<CreateInvitationResponse>('/invitations/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Verify invitation code
   */
  async verifyInvitation(code: string): Promise<VerifyInvitationResponse> {
    return this.request<VerifyInvitationResponse>('/invitations/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  /**
   * Verify invitation code (convenience method)
   */
  async verifyInvitationCode(code: string): Promise<VerifyInvitationResponse> {
    return this.verifyInvitation(code);
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(
    data: AcceptInvitationRequest
  ): Promise<AcceptInvitationResponse> {
    return this.request<AcceptInvitationResponse>('/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get user's connections
   */
  async getConnections(): Promise<GetConnectionsResponse> {
    return this.request<GetConnectionsResponse>('/connections', {
      method: 'GET',
    });
  }

  /**
   * Get user's pending invitations
   */
  async getInvitations(): Promise<GetInvitationsResponse> {
    return this.request<GetInvitationsResponse>('/invitations', {
      method: 'GET',
    });
  }

  // ============================================================================
  // MEMORIES
  // ============================================================================

  /**
   * Create a new memory
   */
  async createMemory(data: CreateMemoryRequest): Promise<CreateMemoryResponse> {
    return this.request<CreateMemoryResponse>('/memories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get memories for a connection
   */
  async getMemories(connectionId: string): Promise<GetMemoriesResponse> {
    return this.request<GetMemoriesResponse>(`/memories/${connectionId}`, {
      method: 'GET',
    });
  }

  /**
   * Get a single memory
   */
  async getMemory(memoryId: string): Promise<GetMemoryResponse> {
    return this.request<GetMemoryResponse>(`/memory/${memoryId}`, {
      method: 'GET',
    });
  }

  /**
   * Update a memory (Keeper only)
   */
  async updateMemory(
    memoryId: string,
    data: UpdateMemoryRequest
  ): Promise<UpdateMemoryResponse> {
    return this.request<UpdateMemoryResponse>(`/memories/${memoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a memory (Keeper only)
   */
  async deleteMemory(memoryId: string): Promise<DeleteMemoryResponse> {
    return this.request<DeleteMemoryResponse>(`/memories/${memoryId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Refresh signed URL for a memory's media files (Phase 3b)
   * Prevents broken images/videos after URLs expire (1 hour)
   */
  async refreshMediaUrl(memoryId: string): Promise<UpdateMemoryResponse> {
    return this.request<UpdateMemoryResponse>(`/memories/${memoryId}/refresh-url`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health', {
      method: 'GET',
    });
  }

  /**
   * TEST ONLY: Ensure Shane and Allison are connected
   */
  async ensureTestUsersConnected(): Promise<{ success: boolean; error?: string }> {
    return this.request<{ success: boolean; error?: string }>('/test/ensure-connected', {
      method: 'POST',
    });
  }

  /**
   * TEST ONLY: Clean up and connect Shane and Allison properly
   * Removes test keeper and creates direct connection
   */
  async cleanupAndConnectShaneAllison(): Promise<{ success: boolean; error?: string; message?: string }> {
    return this.request<{ success: boolean; error?: string; message?: string }>('/test/cleanup-connect-shane-allison', {
      method: 'POST',
    });
  }

  // ============================================================================
  // AI SERVICES
  // ============================================================================

  /**
   * Transcribe audio using Groq Whisper AI
   * Auto-detects language and provides English translation if needed
   */
  async transcribeAudio(audioUrl: string, language?: string): Promise<{
    success?: boolean;
    transcript?: string;
    originalTranscript?: string;
    language?: string;
    translated?: boolean;
    duration?: number;
    error?: string;
  }> {
    return this.request('/ai/transcribe-audio', {
      method: 'POST',
      body: JSON.stringify({ audioUrl, language }),
    });
  }
}

// Export singleton instance
export const apiClient = new AdorasAPIClient();

// Export class for testing
export { AdorasAPIClient };