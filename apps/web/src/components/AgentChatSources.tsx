export function AgentChatSources({ items }: { items?: string[] }) {
  return (
    <ul className="list-inside list-disc text-sm text-slate-600">
      {(items?.length ? items : ["AgentChatSources"]).map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}
