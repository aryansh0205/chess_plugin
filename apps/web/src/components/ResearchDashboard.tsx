import { AgentChatMarkdown } from "./AgentChatMarkdown";
import { AgentChatSources } from "./AgentChatSources";

export function ResearchDashboard() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium text-slate-900">ResearchDashboard</h2>
      <AgentChatMarkdown text="Boilerplate content." />
      <AgentChatSources items={["source-a", "source-b"]} />
    </section>
  );
}
