type StoredSession = {
  access_token?: string;
  refresh_token?: string;
  user?: { id: string };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const restBase = `${supabaseUrl}/rest/v1`;

function getProjectRef() {
  if (!supabaseUrl) return "";
  try {
    const host = new URL(supabaseUrl).hostname;
    return host.split(".")[0] ?? "";
  } catch {
    return "";
  }
}

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const projectRef = getProjectRef();
  if (!projectRef) return null;
  const storageKey = `sb-${projectRef}-auth-token`;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return getStoredSession()?.access_token ?? null;
}

export function getUserId() {
  return getStoredSession()?.user?.id ?? null;
}

type RestOptions = {
  token?: string | null;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
};

export async function restFetch<T>(
  path: string,
  params: Record<string, string> = {},
  options: RestOptions = {}
): Promise<T> {
  const url = new URL(`${restBase}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const send = async (token?: string | null) => {
    const headers: Record<string, string> = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token ?? supabaseAnonKey}`,
    };

    if (options.prefer) {
      headers.Prefer = options.prefer;
    }

    let body: string | undefined;
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    return fetch(url.toString(), {
      method: options.method ?? "GET",
      headers,
      body,
      cache: "no-store",
    });
  };

  const res = await send(options.token);
  if (res.status === 401 && options.token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retry = await send(refreshed);
      if (!retry.ok) {
        const text = await retry.text();
        throw new Error(`${path} ${retry.status} ${text}`);
      }
      const text = await retry.text();
      if (!text) return [] as T;
      return JSON.parse(text) as T;
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} ${res.status} ${text}`);
  }

  const text = await res.text();
  if (!text) {
    return [] as T;
  }
  return JSON.parse(text) as T;
}

async function refreshAccessToken() {
  try {
    const { supabase } = await import("@/lib/supabaseClient");
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    const refreshed = (await Promise.race([supabase.auth.refreshSession(), timeout])) as
      | { data?: { session?: { access_token?: string } } }
      | null;
    const token = refreshed?.data?.session?.access_token ?? getAccessToken();
    return token ?? null;
  } catch {
    return null;
  }
}
