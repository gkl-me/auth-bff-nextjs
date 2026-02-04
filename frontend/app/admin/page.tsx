import { adminService } from "@/services/admin.service";
import UserStatusToggle from "@/components/UserStatusToggle";
import GetUsersButton from "@/components/GetUsersButton";
import Link from "next/link";
import { User } from "@/services/auth.service";
import { handleServerError } from "@/lib/auth-helpers";

export default async function AdminPage() {
  let users: User[] = [];
  let error = null;

  try {
    const response = await adminService.getUsers();
    users = response.data.users;
  } catch (err: any) {
    handleServerError(err);
    console.error("Admin fetch error:", err.message);
    error = "Failed to load users. " + (err.response?.data?.message || err.message);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
           <Link href="/profile" className="text-blue-600 hover:underline">
            Back to Profile
          </Link>
        </div>

        {error && <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.status ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <UserStatusToggle userId={user.userId} isActive={user.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !error && (
             <p className="p-4 text-center text-gray-500">No users found.</p>
          )}
        </div>
        
        <div className="my-6 border-t border-gray-200"></div>
        <GetUsersButton />

      </div>
    </div>
  );
}
