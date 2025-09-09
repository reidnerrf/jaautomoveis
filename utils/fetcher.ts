export interface RetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
}

export interface RequestOptions extends RequestInit {
  expectJson?: boolean;
  retry?: RetryConfig;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number, jitter: boolean) {
  const expo = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  if (!jitter) return expo;
  const rand = Math.random() * expo * 0.4; // +/- 40% jitter
  return Math.max(0, expo - expo * 0.2 + rand);
}

async function parseResponse(response: Response, expectJson: boolean) {
  const contentType = response.headers.get("content-type") || "";
  if (expectJson) {
    if (contentType.includes("application/json")) {
      return response.json();
    }
    // Fallback: attempt to parse text to surface server message
    const text = await response.text();
    throw new Error(`Expected JSON but got '${contentType}'. Body: ${text.slice(0, 200)}`);
  }
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function httpRequest<T = any>(
  input: string | URL | Request,
  init: RequestOptions = {}
): Promise<T> {
  const { expectJson = true, retry = {}, headers, ...rest } = init;

  const { maxRetries = 2, baseDelayMs = 500, maxDelayMs = 5000, jitter = true } = retry;

  let attempt = 0;
  // Merge headers without forcing cache-bypass by default
  const mergedHeaders = new Headers(headers || {});
  if (!mergedHeaders.has("Accept"))
    mergedHeaders.set("Accept", "application/json, text/plain;q=0.9,*/*;q=0.8");

  let shouldRetry = true;
  while (shouldRetry) {
    const response = await fetch(input as any, { ...rest, headers: mergedHeaders });

    if (response.status === 429) {
      // Respect Retry-After header if present
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
      if (attempt >= maxRetries) {
        const body = await response.text().catch(() => "");
        throw new Error(`HTTP 429 Too Many Requests. Body: ${body.slice(0, 200)}`);
      }
      const delay =
        typeof retryAfterSeconds === "number" && !Number.isNaN(retryAfterSeconds)
          ? Math.min(maxDelayMs, retryAfterSeconds * 1000)
          : computeBackoff(attempt, baseDelayMs, maxDelayMs, jitter);
      attempt += 1;
      await sleep(delay);
      continue;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
    }

    shouldRetry = false;
    return parseResponse(response, expectJson);
  }
}

export async function httpGetJson<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  return httpRequest<T>(url, { ...init, expectJson: true });
}

export async function httpPostJson<T = any>(
  url: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  return httpRequest<T>(url, {
    ...init,
    method: "POST",
    headers,
    body: JSON.stringify(body),
    expectJson: true,
  });
}
