"use server";

import { authService } from "@/services/auth.service";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { handleServerError } from "@/lib/auth-helpers";

export async function loginAction(name: string, email: string) {
  try {
    const response = await authService.login({ name, email });
    const { accessToken, refreshToken } = response.data;

    // Save access token in Iron Session
    const session = await getSession();
    session.accessToken = accessToken;
    await session.save();

    // Save refresh token in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // maxAge: ... optional
    });

  } catch (error: any) {
    handleServerError(error);
    // Return error message to be displayed
     const message = error.response?.data?.message || "Login failed";
     return { error: message };
  }
  
  redirect("/profile");
}

export async function updateProfileAction(name: string, email: string) {
  try {
    await authService.updateProfile({ name, email });
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    handleServerError(error);
    const message = error.response?.data?.message || "Update failed";
    return { error: message };
  }
}


export async function getProfileAction() {
  try {
    const response = await authService.getProfile();
    return response.data;
  } catch (error: any) {
    handleServerError(error);
    const message = error.response?.data?.message || "Get profile failed";
    return { error: message };
  }
}
