import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TOKEN_EXPIRY_KEY = 'token_expiry';

class AuthService {
  // API URL do backend (variável de ambiente)
  private getApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/';
  }

  // Token management
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      // Set token expiry to 24 hours from now (adjust based on your API's token expiry)
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
  }

  private isTokenExpired(): boolean {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return true;
      return Date.now() > parseInt(expiry);
    }
    return true;
  }

  // User management
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }
    return true;
  }

  // Register new user
  async register(name: string, password: string): Promise<RegisterResponse> {
    const apiUrl = this.getApiUrl();

    const requestBody: RegisterRequest = { name, password };

    const response = await fetch(`${apiUrl}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Login
  async login(name: string, password: string): Promise<LoginResponse> {
    const apiUrl = this.getApiUrl();
    const requestBody: LoginRequest = { name, password };

    const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }

    const data: LoginResponse = await response.json();

    // Save token and user
    this.setToken(data.token);
    this.setUser(data.user);

    return data;
  }

  // Logout
  logout(): void {
    this.removeToken();
    this.removeUser();
  }

  // Refresh token by re-logging in
  async refreshToken(name: string, password: string): Promise<boolean> {
    try {
      await this.login(name, password);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
