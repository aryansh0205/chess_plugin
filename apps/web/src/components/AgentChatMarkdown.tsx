export function AgentChatMarkdown({ text }: { text?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800">
      {text ?? "AgentChatMarkdown"}
    </div>
  );
}
