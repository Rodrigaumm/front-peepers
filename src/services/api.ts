import { IterateProcessesResponse, ProcessByPidResponse, ProcessByPidRequest } from '@/types/api';

class ApiService {
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('apiUrl') || '';
    }
    return '';
  }

  async iterateProcesses(): Promise<IterateProcessesResponse> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    const response = await fetch(`${baseUrl}/webhook/iterate-processes?webhookurl=${encodeURIComponent(baseUrl)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getProcessByPid(pid: number): Promise<ProcessByPidResponse> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    const requestBody: ProcessByPidRequest = { pid: pid };

    const response = await fetch(`${baseUrl}/webhook/process-by-pid?webhookurl=${encodeURIComponent(baseUrl)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  setApiUrl(url: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiUrl', url);
    }
  }

  getApiUrl(): string {
    return this.getBaseUrl();
  }

  isApiConfigured(): boolean {
    return !!this.getBaseUrl();
  }
}

export const apiService = new ApiService();