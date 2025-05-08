import apiClient, { setAuthToken } from "@src/api/axios-instance";

// Types for authentication
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

// Class for authentication operations
export class AuthService {
  private baseUrl: string;

  private static readonly TOKEN_KEY = "auth_token";

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_BASE_API_URL || "https://api.example.com";
  }

  /**
   * User authentication and token retrieval
   * @param credentials - login credentials
   * @returns Promise with authentication token
   */
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/api/sanctum/token`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      this.saveToken(response.data.token);

      return response.data.token;
    } catch (error) {
      console.error("Error during authentication:", error);
      throw error;
    }
  }

  /**
   * User logout and token removal
   */
  logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
  }

  /**
   * Get token from localStorage
   * @returns token or null if token not found
   */
  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  /**
   * Save token to localStorage
   * @param token - token to save
   */
  saveToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
  }

  /**
   * Check if token exists (user is authenticated)
   * @returns true if token exists, otherwise false
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Apply auth token to all API requests
   */
  setupAuthInterceptor(): void {
    const token = this.getToken();

    if (token) {
      setAuthToken(token);
    }
  }
}

export const authService = new AuthService();
