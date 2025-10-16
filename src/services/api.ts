import { IterateProcessesResponse, ProcessByPidResponse, ProcessByPidRequest, Snapshot } from '@/types/api';
import { authService } from './auth';

class ApiService {
  // API URL do backend (variável de ambiente)
  private getApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // Webhook URL configurada pelo usuário (armazenada no localStorage)
  private getWebhookUrl(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('webhookUrl') || '';
    }
    return '';
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async fetchWithAuth(url: string, options: RequestInit): Promise<Response> {
    const response = await fetch(url, options);

    // If unauthorized and user is authenticated, try to refresh token
    if (response.status === 401 && authService.isAuthenticated()) {
      const user = authService.getUser();
      if (user) {
        // For now, we'll just logout. In a real app, you might want to prompt for password
        // or implement a refresh token mechanism
        authService.logout();
        throw new Error('Authentication expired. Please login again.');
      }
    }

    return response;
  }

  async iterateProcesses(): Promise<IterateProcessesResponse> {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const apiUrl = this.getApiUrl();
    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/webhook/iterate-processes`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          webhook_url: webhookUrl
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getProcessByPid(pid: number): Promise<ProcessByPidResponse> {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const requestBody: ProcessByPidRequest = { pid: pid };

    const apiUrl = this.getApiUrl();
    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/webhook/process-by-pid`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          webhook_url: webhookUrl,
          ...requestBody
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setWebhookUrl(url: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('webhookUrl', url);
    }
  }

  getConfiguredWebhookUrl(): string {
    return this.getWebhookUrl();
  }

  isWebhookConfigured(): boolean {
    return !!this.getWebhookUrl();
  }

  // Snapshot methods
  async getAllSnapshots(): Promise<Snapshot[]> {
    const apiUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/processes/snapshots`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getSnapshotsByType(type: 'iteration' | 'query'): Promise<Snapshot[]> {
    const apiUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/processes/snapshots/type/${type}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getSnapshotById(snapshotId: number): Promise<import('@/types/api').SnapshotDetail> {
    const apiUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/processes/snapshots/${snapshotId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getSnapshotProcesses(snapshotId: number): Promise<import('@/types/api').SnapshotProcessesResponse> {
    const baseUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${baseUrl}/api/v1/processes/snapshots/${snapshotId}/processes`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getSnapshotQueries(snapshotId: number): Promise<import('@/types/api').QueryHistoryResponse> {
    const baseUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${baseUrl}/api/v1/processes/snapshots/${snapshotId}/queries`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getProcessById(processId: number): Promise<import('@/types/api').ProcessInfo> {
    const baseUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${baseUrl}/api/v1/processes/${processId}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getStatistics(): Promise<import('@/types/api').StatisticsResponse> {
    const apiUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/processes/statistics`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteSnapshot(snapshotId: number): Promise<{ success: boolean; message: string }> {
    const apiUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/processes/snapshots/${snapshotId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteProcess(processId: number): Promise<{ success: boolean; message: string }> {
    const apiUrl = this.getApiUrl();

    const response = await this.fetchWithAuth(
      `${apiUrl}/api/v1/processes/${processId}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();