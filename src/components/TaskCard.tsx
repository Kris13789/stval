export type Task = {
  id: number;
  title: string;
  hearts: number;
  emoji: string | null;
  status: "todo" | "pending_approval" | "approved";
};

type TaskCardProps = {
  task: Task;
};

const statusStyles: Record<Task["status"], string> = {
  todo: "bg-slate-100 text-slate-600",
  pending_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
};

const statusLabels: Record<Task["status"], string> = {
  todo: "todo",
  pending_approval: "pending",
  approved: "COMPLETED!",
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span aria-hidden="true">{task.emoji ?? "✅"}</span>
          <span>{task.title}</span>
        </div>
        {task.status !== "todo" && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[task.status]}`}
          >
            {statusLabels[task.status]}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{task.hearts} hearts</span>
        {task.status === "todo" && (
          <button
            type="button"
            className="rounded-md bg-pink-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-pink-600"
          >
            Mark as done!
          </button>
        )}
      </div>
    </article>
  );
}
