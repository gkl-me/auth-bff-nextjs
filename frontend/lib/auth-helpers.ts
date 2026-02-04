import { redirect } from "next/navigation";

export function handleServerError(error: any) {
  // Check for Axios error structure or generic error object
  const status = error.response?.status || error.status;

  if (status === 401) {
    redirect("/login?reason=session_expired");
  }

  if (status === 403) {
    redirect("/login?reason=forbidden");
  }

  // If not an auth error, rethrow to be handled by Error Boundary or caller
  throw error;
}
