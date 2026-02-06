import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

const API_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get session on server
async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // Only attach token if we are on server
    if (typeof window === "undefined") {
      const session = await getSession();
      if (session.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using the refreshToken stored in httpOnly cookie
        // Since we are server-side, we need to read the refreshToken cookie
        // NOTE: The backend expects 'token' in body for refresh, assuming it takes refresh token?
        // Wait, the backend code: const { token } = req.body; const userId = token.split("_")[1];
        // The user says "save the refresh token in cookie".
        // So we need to access that cookie here.
        
        if (typeof window === "undefined") {
          const cookieStore = await cookies();
          const refreshToken = cookieStore.get("refreshToken")?.value;

          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          // Call backend refresh
          // We can't use 'api' instance here to avoid infinite loop if this fails?
          // Or just use axios directly.
          const response = await axios.post(`${API_URL}/refresh-token`, {
            token: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Update session and cookie
          const session = await getSession();
          session.accessToken = accessToken;
          try {
            await session.save();
            cookieStore.set("refreshToken", newRefreshToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               // set other options if needed like path
            });
          } catch (saveError) {
             console.warn("Failed to save session/cookies in interceptor (likely Server Component). Proceeding with in-memory token.", saveError);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
        
      } catch (refreshError) {
        // Refresh failed (or no refresh token)
        // Redirect to login?
        // Just reject, let the caller handle? Or server-side redirect?
        // In Server Components/Actions, we can throw a redirect.
        // But throwing inside interceptor might need care.
        // We will just reject and let the wrapper or action handle redirection 
        // OR we can perform a server-side redirect here if feasible, but usually throwing error is safer for now.
        // Actually, we can assume if refresh fails, session is dead.
        return Promise.reject(refreshError);
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
         // Return the error, consumer handles redirect or show message
         return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
