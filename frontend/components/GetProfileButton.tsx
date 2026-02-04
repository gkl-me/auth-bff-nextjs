"use client";

import { useApi } from "@/hooks/useApi";

export default function GetProfileButton() {
  // Use the route handler URL
  const { data, error, isLoading, execute } = useApi<any>("/api/profile");

  return (
    <div className="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-200">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Client-Side Fetch</h3>
        <button
          onClick={() => execute()}
          disabled={isLoading}
          className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isLoading ? "Loading..." : "Get Profile (Route Handler)"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      
      {data && (
        <pre className="mt-2 overflow-auto rounded bg-gray-800 p-2 text-xs text-green-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
