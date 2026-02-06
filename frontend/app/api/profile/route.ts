import { authService } from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // This calls the backend using the service, which uses the 'api' instance
    // The 'api' instance will attach the Access Token from the session (since we are on server)
    const response = await authService.getProfile();
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log(error)
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "Internal Server Error";
    return NextResponse.json({ message }, { status });
  }
}
