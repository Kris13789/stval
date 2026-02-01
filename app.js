import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://hmmipguhjbklimihatii.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbWlwZ3VoamJrbGltaWhhdGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTQ4NTAsImV4cCI6MjA4NTQ3MDg1MH0.hpoe40z9M8abumchMFm_5lSDX5kKgpB2UHiaCRixOFY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const tasksEl = document.getElementById("tasks");

const statusConfig = {
  todo: { type: "button", label: "Mark as done!" },
  pending_approval: { type: "label", label: "Pending approval", className: "label pending" },
  approved: { type: "label", label: "Completed!", className: "label approved" },
};

const heartString = (count) => {
  const safeCount = Math.max(0, Number(count) || 0);
  return "❤️".repeat(safeCount || 1);
};

const buildStatusNode = (status) => {
  const config = statusConfig[status] || { type: "label", label: status || "Unknown", className: "label" };
  if (config.type === "button") {
    const button = document.createElement("button");
    button.className = "btn";
    button.type = "button";
    button.textContent = config.label;
    return button;
  }
  const label = document.createElement("span");
  label.className = config.className || "label";
  label.textContent = config.label;
  return label;
};

const renderTasks = (tasks) => {
  tasksEl.innerHTML = "";
  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No tasks available yet.";
    tasksEl.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = "card";

    const emoji = document.createElement("div");
    emoji.className = "emoji";
    emoji.textContent = task.emoji || "✅";

    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("h2");
    title.className = "title";
    title.textContent = task.title || "Untitled task";

    const hearts = document.createElement("div");
    hearts.className = "hearts";
    hearts.textContent = heartString(task.hearts);

    meta.appendChild(title);
    meta.appendChild(hearts);

    const action = document.createElement("div");
    action.className = "action";
    action.appendChild(buildStatusNode(task.status));

    card.appendChild(emoji);
    card.appendChild(meta);
    card.appendChild(action);

    tasksEl.appendChild(card);
  });
};

const loadTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,hearts,emoji,status")
    .order("hearts", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  renderTasks(data);
};

loadTasks();
