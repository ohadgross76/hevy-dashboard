"use client";
import { useRouter } from "next/navigation";

export default function DeleteSuggestedButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    await fetch("/api/suggested-routines", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      className="text-xs transition-colors hover:opacity-100 opacity-40"
      style={{ color: "var(--accent)" }}
    >
      Remove
    </button>
  );
}
