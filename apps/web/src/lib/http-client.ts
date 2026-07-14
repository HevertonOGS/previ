import { toast } from './toast-store';

export class HttpClient {
  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      const body = await res.text();
      const message = this.extractMessage(body) || `Request failed: ${res.status}`;
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      throw new Error(message);
    }

    return res.json() as Promise<T>;
  }

  private extractMessage(body: string): string | undefined {
    try {
      const parsed = JSON.parse(body) as { message?: string | string[] };
      if (Array.isArray(parsed.message)) return parsed.message.join(' ');
      return parsed.message;
    } catch {
      return body || undefined;
    }
  }

  public get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  public post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }

  public patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  public delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new HttpClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
);
