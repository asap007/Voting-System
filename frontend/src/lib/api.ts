import { API_URL } from '@/types';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, name: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Form endpoints
  async generateForm(aiPrompt: string, isAnonymous = true, oneResponsePerPerson = true) {
    return this.request<{ form: any; questions: any[] }>('/forms/generate', {
      method: 'POST',
      body: JSON.stringify({
        ai_prompt: aiPrompt,
        is_anonymous: isAnonymous,
        one_response_per_person: oneResponsePerPerson,
      }),
    });
  }

  async getForms() {
    return this.request<{ forms: any[] }>('/forms');
  }

  async getForm(formId: string) {
    return this.request<{ form: any; questions: any[] }>(`/forms/${formId}`);
  }

  async updateForm(
    formId: string, 
    data: {
      title?: string;
      description?: string;
      is_anonymous?: boolean;
      one_response_per_person?: boolean;
      questions?: Array<{
        id: string;
        question_text: string;
        question_type: string;
        options?: string[];
        is_required?: boolean;
        conditional_question_id?: string | null;
        conditional_answer?: string | null;
      }>;
    }
  ) {
    return this.request<{ message: string }>(`/forms/${formId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async publishForm(formId: string) {
    return this.request(`/forms/${formId}/publish`, { method: 'PUT' });
  }

  async deleteForm(formId: string) {
    return this.request(`/forms/${formId}`, { method: 'DELETE' });
  }

  // Response endpoints
  async submitResponse(formId: string, answers: Record<string, any>, userFingerprint?: string) {
    return this.request<{ message: string; response_id: string }>('/responses/submit', {
      method: 'POST',
      body: JSON.stringify({
        form_id: formId,
        answers,
        user_fingerprint: userFingerprint,
      }),
    });
  }

  async getResponseCount(formId: string) {
    return this.request<{ count: number }>(`/responses/count/${formId}`);
  }

  // Analytics endpoints
  async getAnalytics(formId: string) {
    return this.request<{ analytics: any; insights: string; cached: boolean }>(
      `/analytics/${formId}`
    );
  }

  async exportResponses(formId: string) {
    return this.request<{ responses: any[] }>(`/analytics/${formId}/export`);
  }
}

export const api = new ApiClient();
