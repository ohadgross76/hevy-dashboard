"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RoutineBlock {
  title: string;
  day: string;
  week: string;
  exercises: { name: string; sets: { reps: number; weight_kg?: number }[] }[];
}

function parseRoutineBlocks(text: string): { segments: { type: "text" | "routine"; content: string }[] } {
  const segments: { type: "text" | "routine"; content: string }[] = [];
  const regex = /```routine\n([\s\S]*?)```/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: "text", content: text.slice(last, match.index) });
    segments.push({ type: "routine", content: match[1].trim() });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", content: text.slice(last) });
  return { segments };
}

function RoutineCard({ json }: { json: string }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  let routine: RoutineBlock;
  try {
    routine = JSON.parse(json);
  } catch {
    return <pre className="text-xs text-red-400 p-2">{json}</pre>;
  }

  async function save() {
    setSaving(true);
    await fetch("/api/suggested-routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(routine),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div
      className="my-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--accent)", background: "var(--surface)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#2a1a0e", borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <span className="font-semibold text-white text-sm">{routine.title}</span>
          <span className="ml-2 text-xs" style={{ color: "var(--accent)" }}>
            {routine.day} · {routine.week}
          </span>
        </div>
        <button
          onClick={save}
          disabled={saved || saving}
          className="text-xs px-3 py-1 rounded-lg font-medium transition-opacity disabled:opacity-50"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {saved ? "✓ Saved" : saving ? "Saving…" : "Save to Routines"}
        </button>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr
            className="text-left uppercase tracking-wide"
            style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}
          >
            <th className="px-4 py-2">Exercise</th>
            <th className="px-4 py-2 text-center">Sets</th>
            <th className="px-4 py-2 text-center">Reps</th>
            <th className="px-4 py-2 text-center">Weight</th>
          </tr>
        </thead>
        <tbody>
          {routine.exercises.map((ex, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <td className="px-4 py-2 font-medium text-white">{ex.name}</td>
              <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>{ex.sets.length}</td>
              <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>
                {(() => {
                  const reps = ex.sets.map((s) => s.reps);
                  const min = Math.min(...reps), max = Math.max(...reps);
                  return min === max ? `${min}` : `${min}–${max}`;
                })()}
              </td>
              <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>
                {(() => {
                  const weights = ex.sets.map((s) => s.weight_kg).filter((w): w is number => w !== undefined && w > 0);
                  if (!weights.length) return "—";
                  const min = Math.min(...weights), max = Math.max(...weights);
                  return min === max ? `${min} kg` : `${min}–${max} kg`;
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div
          className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm whitespace-pre-wrap text-white"
          style={{ background: "var(--accent)" }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  const { segments } = parseRoutineBlocks(msg.content);

  return (
    <div className="flex justify-start mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black mr-2 mt-1 shrink-0"
        style={{ background: "var(--accent)" }}
      >
        H
      </div>
      <div className="max-w-[80%]">
        {segments.map((seg, i) =>
          seg.type === "routine" ? (
            <RoutineCard key={i} json={seg.content} />
          ) : (
            <div
              key={i}
              className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm whitespace-pre-wrap text-white mb-1"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {seg.content.trim()}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey Ohad! I'm your training coach. I have full context of your routines, workout history, and your current plan.\n\nAsk me anything — or say \"build next week's routines\" and I'll generate them ready to save.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen md:h-screen" style={{ height: "calc(100dvh - 60px)" }}>
      <div className="px-4 py-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <h1 className="text-base font-bold text-white">Training Coach</h1>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Powered by Claude Sonnet · knows your Hevy data live
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: "var(--background)" }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start mb-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black mr-2 mt-1 shrink-0"
              style={{ background: "var(--accent)" }}
            >
              H
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: "var(--muted)" }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: "var(--muted)" }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: "var(--muted)" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              // @ts-ignore
              "--tw-ring-color": "var(--accent)",
            }}
            rows={1}
            placeholder="Ask about your training, or say 'build next week's routines'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: "var(--accent)" }}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-center mt-1.5" style={{ color: "var(--muted)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
