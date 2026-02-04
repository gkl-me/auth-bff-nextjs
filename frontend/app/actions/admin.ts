"use server";

import { adminService } from "@/services/admin.service";
import { revalidatePath } from "next/cache";
import { handleServerError } from "@/lib/auth-helpers";

export async function toggleUserStatusAction(userId: string) {
  try {
    await adminService.toggleUserStatus(userId);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
     handleServerError(error);
     const message = error.response?.data?.message || "Failed to update status";
     return { error: message };
  }
}
