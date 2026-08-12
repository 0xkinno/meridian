const DEFAULT_API_URL = 'https://app.keeperhub.com';
const MAX_ATTEMPTS = 5;
const MAX_RETRY_DELAY_MS = 30_000;

export interface KeeperHubResponse<T = unknown> {
  status: number;
  data: T;
  ok: boolean;
  headers: Headers;
}

export class KeeperHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseData: unknown,
    readonly responseHeaders?: Headers,
  ) {
    super(message);
    this.name = 'KeeperHubError';
  }
}

function apiUrl(): string {
  return (process.env.KEEPERHUB_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
}

function apiKey(): string {
  const key = process.env.KEEPERHUB_API_KEY;
  if (!key) throw new Error('KEEPERHUB_API_KEY is not configured');
  if (!key.startsWith('kh_')) throw new Error('KEEPERHUB_API_KEY must be an organization key beginning with kh_');
  return key;
}

function retryDelay(headers: Headers, attempt: number): number {
  const retryAfter = headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1_000, MAX_RETRY_DELAY_MS);
  }
  return Math.min(1_000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function keeperHubRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<KeeperHubResponse<T>> {
  const url = `${apiUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 429 && attempt < MAX_ATTEMPTS - 1) {
      await sleep(retryDelay(response.headers, attempt));
      continue;
    }

    const text = await response.text();
    let data: T;
    try {
      data = (text ? JSON.parse(text) : null) as T;
    } catch {
      data = { error: text.slice(0, 500) } as T;
    }

    return { status: response.status, data, ok: response.ok, headers: response.headers };
  }

  throw new Error('KeeperHub request exhausted retry attempts');
}

export async function verifyConnection(): Promise<boolean> {
  const response = await keeperHubRequest('/api/keys');
  return response.status === 200;
}

export interface KeeperHubUser {
  walletAddress: string;
  [key: string]: unknown;
}

export async function getUser(): Promise<KeeperHubUser> {
  const response = await keeperHubRequest<KeeperHubUser>('/api/user');
  if (!response.ok) {
    throw new KeeperHubError('Failed to get KeeperHub user', response.status, response.data, response.headers);
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(response.data.walletAddress)) {
    throw new Error('KeeperHub returned an invalid organization wallet address');
  }
  return response.data;
}

export async function getWalletAddress(): Promise<string> {
  return (await getUser()).walletAddress;
}

export async function getChains(): Promise<unknown[]> {
  const response = await keeperHubRequest<unknown[]>('/api/chains');
  if (!response.ok) throw new KeeperHubError('Failed to get KeeperHub chains', response.status, response.data);
  return Array.isArray(response.data) ? response.data : [];
}

export async function getIntegrations(): Promise<Array<{ id: string; [key: string]: unknown }>> {
  const response = await keeperHubRequest<Array<{ id: string }>>('/api/integrations');
  if (!response.ok) throw new KeeperHubError('Failed to get KeeperHub integrations', response.status, response.data);
  return Array.isArray(response.data) ? response.data : [];
}

