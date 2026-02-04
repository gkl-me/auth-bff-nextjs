import { authService } from "@/services/auth.service";
import GetProfileButton from "@/components/GetProfileButton";
import UpdateProfileForm from "@/components/UpdateProfileForm";
import Link from "next/link";
import { User } from "@/services/auth.service";
import { handleServerError } from "@/lib/auth-helpers";

export default async function ProfilePage() {
  let user: User | null = null;
  let error = null;

  try {
    const response = await authService.getProfile();
    user = response.data.user;
  } catch (err: any) {
      handleServerError(err);
      console.error("Profile fetch error:", err.message);
      error = "Failed to load profile. " + (err.response?.data?.message || err.message);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Go to Admin
          </Link>
        </div>

        {error && <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>}

        {user && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="font-semibold text-gray-600">Name:</div>
              <div>{user.name}</div>
              <div className="font-semibold text-gray-600">Email:</div>
              <div>{user.email}</div>
              <div className="font-semibold text-gray-600">User ID:</div>
              <div className="truncate font-mono text-sm bg-gray-100 p-1 rounded">{user.userId}</div>
              <div className="font-semibold text-gray-600">Status:</div>
              <div>
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    user.status
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.status ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="my-6 border-t border-gray-200"></div>

        {user && <UpdateProfileForm initialName={user.name} initialEmail={user.email} />}

        <div className="my-6 border-t border-gray-200"></div>

        <GetProfileButton />
      </div>
    </div>
  );
}
