import type { GameMode } from "../types";

type Props = {
  mode: GameMode;
  status: string;
  statusColor?: string;
  voiceOn?: boolean;
  fourVsCpu?: boolean;
  onToggleFourCpu?: () => void;
  onToggleVoice?: () => void;
  onNewGame: () => void;
  onChangeMode: (mode: GameMode) => void;
  moveHistory?: string[];
};

const MODES: { id: GameMode; label: string; desc: string }[] = [
  { id: "cpu", label: "vs CPU", desc: "Play as White against the computer" },
  { id: "2p", label: "2 Player", desc: "Local hot-seat on one device" },
  { id: "4p", label: "4 Player", desc: "Plus-shaped board — CPU or free play" },
];

export function GamePanel({
  mode,
  status,
  statusColor,
  voiceOn = true,
  fourVsCpu = true,
  onToggleFourCpu,
  onToggleVoice,
  onNewGame,
  onChangeMode,
  moveHistory = [],
}: Props) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-fg-muted">
          Game mode
        </p>
        <div className="flex flex-col gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMode(m.id)}
              className={[
                "rounded-xl border px-4 py-3 text-left transition",
                mode === m.id
                  ? "border-accent bg-accent/10 text-fg"
                  : "border-border bg-surface/80 text-fg-muted hover:border-accent/50 hover:text-fg",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold">{m.label}</span>
              <span className="mt-0.5 block text-xs text-fg-muted">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border border-border bg-surface/80 px-4 py-3"
        style={
          statusColor
            ? { borderColor: statusColor, boxShadow: `inset 3px 0 0 ${statusColor}` }
            : undefined
        }
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fg-muted">Status</p>
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-fg">
          {statusColor && (
            <span
              className="chess-turn-chip h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: statusColor, ["--turn-color" as string]: statusColor }}
            />
          )}
          {status}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {mode === "4p" && onToggleFourCpu && (
          <button
            type="button"
            onClick={onToggleFourCpu}
            className={[
              "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
              fourVsCpu
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-surface text-fg-muted hover:border-accent hover:text-fg",
            ].join(" ")}
            aria-pressed={fourVsCpu}
          >
            {fourVsCpu ? "CPU on — you play Yellow" : "CPU off — free play"}
          </button>
        )}
        <button
          type="button"
          onClick={onNewGame}
          className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-fg transition hover:border-accent hover:text-accent"
        >
          New game
        </button>
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            className={[
              "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
              voiceOn
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border bg-surface text-fg-muted hover:border-accent hover:text-fg",
            ].join(" ")}
          >
            {voiceOn ? "Voice announcements on" : "Voice announcements off"}
          </button>
        )}
      </div>

      {moveHistory.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-surface/60 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-fg-muted">
            Moves
          </p>
          <ol className="space-y-1 font-mono text-xs text-fg-muted">
            {moveHistory.map((move, i) => (
              <li key={i}>{move}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
