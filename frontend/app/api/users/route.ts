import { adminService } from "@/services/admin.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await adminService.getUsers();
    return NextResponse.json(response.data);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "Internal Server Error";
    return NextResponse.json({ message }, { status });
  }
}
