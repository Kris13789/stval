import { TaskCard, type Task } from "@/components/TaskCard";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const toTask = (task: {
  id: number;
  title: string;
  hearts: number | null;
  emoji: string | null;
  status: string | null;
}): Task => {
  const status =
    task.status === "pending_approval" || task.status === "approved"
      ? task.status
      : "todo";

  return {
    id: task.id,
    title: task.title,
    hearts: task.hearts ?? 0,
    emoji: task.emoji,
    status,
  };
};

export default async function Home() {
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,hearts,emoji,status")
    .order("hearts", { ascending: true });

  const tasks = data ? data.map(toTask) : [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
            Tasks
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Hearts for hubby
          </h1>
          <p className="text-base text-slate-600">
            Sorted by hearts, from the easiest to the most rewarding.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Could not load tasks. Please check your Supabase settings.
          </div>
        )}

        {!error && tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
            No tasks yet. Add some tasks in Supabase to see them here.
          </div>
        )}

        <section className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </section>
      </main>
    </div>
  );
}
