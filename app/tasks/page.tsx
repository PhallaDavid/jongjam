"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Check,
  Circle,
  Clock,
  ArrowLeft,
  Calendar,
  LayoutList,
  Columns3,
  X,
  GripVertical,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/user-menu";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "todo" | "in_progress" | "done";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  createdAt: Date;
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  low: { label: "Low", color: "text-emerald-500", dot: "bg-emerald-400" },
  medium: { label: "Medium", color: "text-amber-500", dot: "bg-amber-400" },
  high: { label: "High", color: "text-orange-500", dot: "bg-orange-400" },
  urgent: { label: "Urgent", color: "text-red-500", dot: "bg-red-400" },
};

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ReactNode; bg: string; border: string; header: string }> = {
  todo: {
    label: "To Do",
    icon: <Circle className="w-4 h-4" />,
    bg: "bg-zinc-50 dark:bg-zinc-900/50",
    border: "border-zinc-200 dark:border-zinc-800",
    header: "bg-zinc-100 dark:bg-zinc-800/80",
  },
  in_progress: {
    label: "In Progress",
    icon: <Clock className="w-4 h-4" />,
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-900",
    header: "bg-blue-100/80 dark:bg-blue-900/40",
  },
  done: {
    label: "Done",
    icon: <Check className="w-4 h-4" />,
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900",
    header: "bg-emerald-100/80 dark:bg-emerald-900/40",
  },
};


function TaskCard({
  task,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const priority = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  const cycleStatus = () => {
    const order: Status[] = ["todo", "in_progress", "done"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    onStatusChange(task.id, next);
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* Status toggle */}
        <button
          onClick={cycleStatus}
          className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            task.status === "done"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : task.status === "in_progress"
              ? "border-blue-400 text-blue-400"
              : "border-zinc-300 dark:border-zinc-600 text-transparent"
          }`}
          title="Cycle status"
        >
          <Check className="w-3 h-3" />
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold leading-snug ${
              task.status === "done"
                ? "line-through text-zinc-400 dark:text-zinc-600"
                : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {/* Priority */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${priority.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                  isOverdue
                    ? "text-red-500"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-zinc-300 hover:text-red-500 dark:text-zinc-600 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function AddTaskModal({
  onAdd,
  onClose,
  defaultStatus,
}: {
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void;
  onClose: () => void;
  defaultStatus: Status;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description, priority, status, dueDate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <input
              autoFocus
              className="w-full bg-transparent text-base font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none border-b border-zinc-200 dark:border-zinc-700 pb-2 focus:border-violet-400 transition-colors"
              placeholder="Task title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <textarea
            className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 outline-none resize-none min-h-[80px] border border-zinc-200 dark:border-zinc-700 focus:border-violet-400 transition-colors"
            placeholder="Description (optional)…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block uppercase tracking-wide">
                Priority
              </label>
              <div className="flex flex-col gap-1">
                {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      priority === key
                        ? "bg-zinc-100 dark:bg-zinc-700 font-semibold"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${val.dot}`} />
                    <span className={priority === key ? val.color : "text-zinc-500 dark:text-zinc-400"}>{val.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status + Due date */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block uppercase tracking-wide">
                  Status
                </label>
                <div className="flex flex-col gap-1">
                  {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatus(key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        status === key
                          ? "bg-zinc-100 dark:bg-zinc-700 font-semibold text-zinc-900 dark:text-zinc-100"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {val.icon}
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 block uppercase tracking-wide">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-400 transition-colors"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              disabled={!title.trim()}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<Status>("todo");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const { user } = useAuth();

  // Real-time Firestore listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data: Task[] = snapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title ?? "",
          description: d.data().description ?? "",
          priority: (d.data().priority ?? "medium") as Priority,
          status: (d.data().status ?? "todo") as Status,
          dueDate: d.data().dueDate ?? "",
          createdAt: d.data().createdAt?.toDate() ?? new Date(),
        }));
        setTasks(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error in Tasks:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "tasks"), {
        ...task,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
    } catch (err: any) {
      console.error("Error creating task:", err);
      alert("Failed to create task: " + err.message + "\n\nIf this says 'insufficient permissions', make sure your Firestore database is in Test Mode.");
    }
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const updateStatus = async (id: string, status: Status) => {
    await updateDoc(doc(db, "tasks", id), { status });
  };

  const filtered = tasks.filter(
    (t) => filterPriority === "all" || t.priority === filterPriority
  );

  const byStatus = (status: Status) => filtered.filter((t) => t.status === status);

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  };

  const openModal = (status: Status = "todo") => {
    setModalStatus(status);
    setShowModal(true);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <a
              href="/"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
              title="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <span className="font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="hidden sm:inline text-base">Task Manager</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 gap-1">
              <button
                onClick={() => setView("kanban")}
                className={`p-1.5 rounded-full transition-colors ${
                  view === "kanban"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
                title="Kanban view"
              >
                <Columns3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-full transition-colors ${
                  view === "list"
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
                title="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserMenu />
            </div>

            <button
              onClick={() => openModal("todo")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-zinc-400 dark:text-zinc-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading tasks…</span>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6 w-full">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-zinc-700 dark:text-zinc-200", bg: "bg-white dark:bg-zinc-900" },
            { label: "To Do", value: stats.todo, color: "text-zinc-500", bg: "bg-white dark:bg-zinc-900" },
            { label: "In Progress", value: stats.inProgress, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Completed", value: stats.done, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4`}>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
              <p className={`text-xs font-semibold mt-0.5 ${s.color}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Overall Progress</span>
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
              {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Filter by priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Filter:</span>
          {(["all", "urgent", "high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterPriority === p
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {p === "all" ? "All" : (
                <span className={`flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[p].dot}`} />
                  {PRIORITY_CONFIG[p].label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* KANBAN VIEW */}
        {view === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([status, cfg]) => {
              const columnTasks = byStatus(status);
              return (
                <div key={status} className={`rounded-2xl border ${cfg.border} overflow-hidden flex flex-col`}>
                  <div className={`${cfg.header} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                      {cfg.icon}
                      {cfg.label}
                      <span className="ml-1 bg-white/60 dark:bg-black/30 text-xs font-bold px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => openModal(status)}
                      className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-zinc-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`flex-1 ${cfg.bg} p-3 flex flex-col gap-2 min-h-[200px]`}>
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-zinc-300 dark:text-zinc-700 gap-2">
                        <GripVertical className="w-6 h-6" />
                        <p className="text-xs">No tasks</p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onDelete={deleteTask}
                          onStatusChange={updateStatus}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-zinc-300 dark:text-zinc-700 gap-3">
                <LayoutList className="w-10 h-10" />
                <p className="text-sm">No tasks found</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((task) => {
                  const priority = PRIORITY_CONFIG[task.priority];
                  const status = STATUS_CONFIG[task.status];
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <button
                        onClick={() => updateStatus(task.id, task.status === "done" ? "todo" : "done")}
                        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.status === "done"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-zinc-300 dark:border-zinc-600"
                        }`}
                      >
                        {task.status === "done" && <Check className="w-3 h-3" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-zinc-400 truncate mt-0.5">{task.description}</p>
                        )}
                      </div>

                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <span className={`flex items-center gap-1 text-xs font-medium ${priority.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                          {priority.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                          {status.icon}
                          <span className="hidden md:inline">{status.label}</span>
                        </span>
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"}`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/40 text-zinc-300 hover:text-red-500 dark:text-zinc-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <AddTaskModal
          onAdd={addTask}
          onClose={() => setShowModal(false)}
          defaultStatus={modalStatus}
        />
      )}
    </div>
    </AuthGuard>
  );
}
