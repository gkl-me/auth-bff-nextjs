"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions/auth";

export default function UpdateProfileForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfileAction(name, email);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "Profile updated successfully!", type: "success" });
      }
    });
  };

  return (
    <div className="mt-8 rounded-lg bg-gray-50 p-6 border border-gray-200">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Update Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {message && (
          <div
            className={`p-2 text-sm rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isPending ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
