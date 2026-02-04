import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseApiReturn<T, P> extends UseApiState<T> {
  execute: (params?: P) => Promise<void>;
}

// Function that returns a Promise, e.g., axios.get(...)
type ApiFunction<T, P> = (params?: P) => Promise<T>;

export function useApi<T, P = void>(apiFuncOrUrl: string | ((params?: P) => Promise<T>)): UseApiReturn<T, P> {
  const router = useRouter();
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (params?: P) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        let result: T;
        if (typeof apiFuncOrUrl === "string") {
            // Assume it's a URL to fetch
            const response = await axios.get(apiFuncOrUrl);
            result = response.data;
        } else {
             // Assume it's a function
             result = await apiFuncOrUrl(params);
        }
        
        setState({ data: result, error: null, isLoading: false });
      } catch (err: any) {
        const status = err.response?.status || err.status;
        
        if (status === 401) {
             router.push("/login?reason=session_expired");
             return;
        }
        if (status === 403) {
             router.push("/login?reason=forbidden");
             return;
        }

        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message || err.message
            : "An unexpected error occurred";
        setState({ data: null, error: errorMessage, isLoading: false });
      }
    },
    [apiFuncOrUrl, router]
  );

  return { ...state, execute };
}
