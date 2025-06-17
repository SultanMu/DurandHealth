import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = "https://api.durandhealth.ngrok.io";

// JWT token management
let authToken: string | null = null;

// Initialize token from localStorage if available
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('authToken');
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
}

export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return authToken || localStorage.getItem('authToken');
  }
  return authToken;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      // Clear invalid token
      setAuthToken(null);
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add JWT token to headers if available
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  console.log('Making API request to:', fullUrl);
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add JWT token to headers if available
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    console.log('Making query request to:', fullUrl);
    
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      setAuthToken(null);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
