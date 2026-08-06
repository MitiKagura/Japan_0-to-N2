const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5013/api';

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  created_at?: string;
}

export interface ProgressItem {
  score: number;
  completed_at: string;
}

export type ProgressMap = Record<string, ProgressItem>;

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('sakura_token');
  }

  private setToken(token: string | null) {
    if (token) localStorage.setItem('sakura_token', token);
    else localStorage.removeItem('sakura_token');
  }

  private async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.error || res.statusText, res.status);
    return data as T;
  }

  async register(data: { username: string; email: string; password: string; display_name?: string }): Promise<{ token: string; user: User }> {
    const r = await this.request<{ token: string; user: User }>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(r.token);
    return r;
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const r = await this.request<{ token: string; user: User }>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(r.token);
    return r;
  }

  async me(): Promise<User> {
    const r = await this.request<{ user: User }>('/me');
    return r.user;
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('sakura_user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getStoredUser(): User | null {
    const raw = localStorage.getItem('sakura_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async getProgress(): Promise<ProgressMap> {
    const r = await this.request<{ progress: ProgressMap }>('/progress');
    return r.progress;
  }

  async markLesson(lessonId: string, score: number = 100): Promise<void> {
    await this.request(`/progress/${encodeURIComponent(lessonId)}`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    });
  }

  async unmarkLesson(lessonId: string): Promise<void> {
    await this.request(`/progress/${encodeURIComponent(lessonId)}`, { method: 'DELETE' });
  }

  async health(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const api = new ApiClient();
