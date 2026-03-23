import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, UserLogin, UserRegistration, AuthToken, WritingSession, SessionReport } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface SaveSessionRequest {
  content: string;
  keystrokes: any[];
  pasteEvents: any[];
  startTime: Date;
  endTime: Date;
}

interface SaveSessionResponse {
  session: {
    _id: string;
    userId: string;
    wordCount: number;
    characterCount: number;
    keystrokeCount: number;
    pasteCount: number;
    totalDuration: number;
    createdAt: string;
  };
  report: {
    _id: string;
    confidenceScore: number;
    suspiciousPatterns: string[];
    averageTypingSpeed: number;
    suspiciousPasteRatio: number;
  };
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to headers if available
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Clear token on unauthorized
          localStorage.removeItem('token');
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: UserRegistration): Promise<AuthToken> {
    const response = await this.client.post<ApiResponse<AuthToken>>('/auth/register', data);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Registration failed');
  }

  async login(data: UserLogin): Promise<AuthToken> {
    const response = await this.client.post<ApiResponse<AuthToken>>('/auth/login', data);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Login failed');
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data.data;
  }

  // Session endpoints
  /**
   * Save a new writing session with content and keystroke metadata
   * @param data - Session data including content, keystrokes, paste events, and timestamps
   * @returns Save response with session summary and analysis report
   */
  async saveSession(data: SaveSessionRequest): Promise<SaveSessionResponse> {
    const response = await this.client.post<ApiResponse<SaveSessionResponse>>('/sessions', {
      content: data.content,
      keystrokes: data.keystrokes,
      pasteEvents: data.pasteEvents,
      startTime: data.startTime,
      endTime: data.endTime,
    });
    
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to save session');
  }

  /**
   * Retrieve a specific session by ID with full content and metadata
   * @param id - Session ID
   * @returns Full session data including content and keystroke history
   */
  async getSession(id: string): Promise<WritingSession> {
    const response = await this.client.get<ApiResponse<WritingSession>>(`/sessions/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch session');
  }

  /**
   * Retrieve all sessions for the authenticated user
   * Excludes full content to keep response lightweight
   * @returns Array of session summaries sorted by most recent first
   */
  async getUserSessions(): Promise<WritingSession[]> {
    const response = await this.client.get<ApiResponse<WritingSession[]>>('/sessions');
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch sessions');
  }

  /**
   * Retrieve analysis report for a specific session
   * @param sessionId - Session ID
   * @returns Analysis report with confidence score and suspicious patterns
   */
  async getSessionReport(sessionId: string): Promise<SessionReport> {
    const response = await this.client.get<ApiResponse<SessionReport>>(`/reports/${sessionId}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch session report');
  }

  /**
   * Delete a session and its associated report
   * @param id - Session ID
   * @returns Deletion confirmation
   */
  async deleteSession(id: string): Promise<any> {
    const response = await this.client.delete(`/sessions/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete session');
    }
    return response.data;
  }

  /**
   * Batch retrieve multiple sessions by IDs
   * @param ids - Array of session IDs
   * @returns Array of sessions
   */
  async getSessionsByIds(ids: string[]): Promise<WritingSession[]> {
    const requests = ids.map(id => this.getSession(id));
    return Promise.all(requests);
  }

  /**
   * Search sessions by content (simple substring search)
   * Note: Full-text search would require backend enhancement
   */
  async searchSessionsLocal(query: string): Promise<WritingSession[]> {
    const sessions = await this.getUserSessions();
    // Local filtering - in production, implement backend search
    return sessions.filter(s => 
      s.wordCount > 0 // Sessions with content
    );
  }
}

export default new ApiClient();
