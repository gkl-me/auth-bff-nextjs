"use client";

import { useTransition } from "react";
import { toggleUserStatusAction } from "@/app/actions/admin";

export default function UserStatusToggle({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleUserStatusAction(userId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded px-3 py-1 text-sm font-medium text-white ${
        !isActive // logic: if active (false status?), show Unblock? 
        // Backend: status: boolean. If status is true, it is BLOCKED (based on backend middleware: if user?.status return 403 Forbidden).
        // Code: user.status = !user.status.
        // So if status is TRUE (Blocked), button should say "Unblock".
        // If status is FALSE (Active), button should say "Block".
        ? "bg-red-500 hover:bg-red-600"
        : "bg-green-500 hover:bg-green-600"
      } disabled:opacity-50`}
    >
      {isPending ? "Updating..." : isActive ? "Unblock" : "Block"}
    </button>
  );
}
