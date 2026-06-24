"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Trash2, Pin, Search, Palette, X, Check, ArrowLeft, NotebookPen, FileX, Loader2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/user-menu";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
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

type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: Date;
};

const NOTE_COLORS = [
  { bg: "bg-white dark:bg-zinc-800", border: "border-zinc-200 dark:border-zinc-700", value: "default" },
  { bg: "bg-yellow-50 dark:bg-yellow-950/40", border: "border-yellow-200 dark:border-yellow-800", value: "yellow" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", value: "green" },
  { bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800", value: "blue" },
  { bg: "bg-pink-50 dark:bg-pink-950/40", border: "border-pink-200 dark:border-pink-800", value: "pink" },
  { bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800", value: "purple" },
];

const getColorClasses = (value: string) => {
  return NOTE_COLORS.find((c) => c.value === value) ?? NOTE_COLORS[0];
};

const getColorLabel = (value: string, t: any) => {
  switch (value) {
    case "yellow": return t("colorYellow");
    case "green": return t("colorGreen");
    case "blue": return t("colorBlue");
    case "pink": return t("colorPink");
    case "purple": return t("colorPurple");
    default: return t("colorDefault");
  }
};

function NoteCard({
  note,
  onDelete,
  onTogglePin,
  onUpdate,
  onColorChange,
}: {
  note: Note;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onUpdate: (id: string, field: "title" | "content", value: string) => void;
  onColorChange: (id: string, color: string) => void;
}) {
  const [showPalette, setShowPalette] = useState(false);
  const color = getColorClasses(note.color);
  const { t } = useLanguage();

  return (
    <div className={`group relative flex flex-col rounded-2xl border ${color.bg} ${color.border} shadow-sm hover:shadow-xl transition-all duration-300 overflow-visible`}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <input
          className="flex-1 min-w-0 bg-transparent font-semibold text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
          value={note.title}
          placeholder={t("titlePlaceholder")}
          onChange={(e) => onUpdate(note.id, "title", e.target.value)}
        />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onTogglePin(note.id)}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${note.pinned ? "text-amber-500" : "text-zinc-400"}`}
            title={t("pin")}
          >
            <Pin className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowPalette((p) => !p)}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 transition-colors"
              title={t("changeColor")}
            >
              <Palette className="w-4 h-4" />
            </button>
            {showPalette && (
              <div className="absolute right-0 top-8 z-50 flex gap-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={getColorLabel(c.value, t)}
                    onClick={() => { onColorChange(note.id, c.value); setShowPalette(false); }}
                    className={`w-6 h-6 rounded-full border-2 ${c.bg} ${note.color === c.value ? "border-zinc-700 dark:border-zinc-200" : "border-zinc-300 dark:border-zinc-600"} hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-500 transition-colors"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <textarea
        className="flex-1 resize-none bg-transparent px-4 pb-4 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none min-h-[100px]"
        value={note.content}
        placeholder={t("writeNoteHere")}
        onChange={(e) => onUpdate(note.id, "content", e.target.value)}
      />

      <div className="px-4 pb-3 text-[10px] text-zinc-400 dark:text-zinc-600">
        {note.pinned && <span className="text-amber-500 font-semibold mr-2">📌 {t("pinned")}</span>}
        {note.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </div>
    </div>
  );
}

function NewNoteInput({ onCreate }: { onCreate: (title: string, content: string) => void }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (title.trim() || content.trim()) onCreate(title, content);
        setExpanded(false);
        setTitle("");
        setContent("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [title, content, onCreate]);

  return (
    <div ref={ref} className="w-full max-w-lg mx-auto">
      <div className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-md transition-all duration-200 overflow-hidden ${expanded ? "shadow-xl" : ""}`}>
        {expanded && (
          <input
            autoFocus
            className="w-full bg-transparent px-5 pt-4 pb-1 font-semibold text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
            placeholder={t("titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}
        <div className="flex items-center gap-3 px-5 py-3">
          <input
            className="flex-1 bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-500 outline-none"
            placeholder={t("takeNote")}
            onFocus={() => setExpanded(true)}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {!expanded && (
            <button onClick={() => setExpanded(true)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          )}
          {expanded && (
            <button
              onClick={() => {
                if (title.trim() || content.trim()) onCreate(title, content);
                setExpanded(false); setTitle(""); setContent("");
              }}
              className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {t("done")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { success, error } = useToast();
  const { t } = useLanguage();

  // Real-time Firestore listener
  useEffect(() => {
    console.log("NotesApp useEffect running. User:", user?.uid);
    if (!user) return;
    console.log("Setting up Firestore query...");
    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    console.log("Calling onSnapshot...");
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        console.log("onSnapshot SUCCESS! Docs count:", snapshot.docs.length);
        const data: Note[] = snapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title ?? "",
          content: d.data().content ?? "",
          color: d.data().color ?? "default",
          pinned: d.data().pinned ?? false,
          createdAt: d.data().createdAt?.toDate() ?? new Date(),
        }));
        setNotes(data);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error in Notes onSnapshot:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const createNote = useCallback(async (title: string, content: string) => {
    console.log("createNote called with:", { title, content });
    if (!title.trim() && !content.trim()) {
      console.log("createNote aborted: empty");
      return;
    }
    if (!user) {
      console.log("createNote aborted: no user");
      return;
    }
    try {
      console.log("Calling addDoc for user:", user.uid);
      const docRef = await addDoc(collection(db, "notes"), {
        title,
        content,
        userId: user.uid,
        color: "default",
        pinned: false,
        createdAt: serverTimestamp(),
      });
      console.log("addDoc SUCCESS! ID:", docRef.id);
      success(t("noteCreated"));
    } catch (err: any) {
      console.error("Error creating note:", err);
      error(`${t("failedCreateNote")}: ${err.message}`);
    }
  }, [user, success, error, t]);

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      success(t("noteDeleted"));
    } catch (err: any) {
      console.error("Error deleting note:", err);
      error(`${t("failedDeleteNote")}: ${err.message}`);
    }
  };

  const togglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    try {
      await updateDoc(doc(db, "notes", id), { pinned: !note.pinned });
      success(note.pinned ? t("noteUnpinned") : t("notePinned"));
    } catch (err: any) {
      console.error("Error updating pin state:", err);
      error(`${t("failedUpdatePin")}: ${err.message}`);
    }
  };

  const updateNote = async (id: string, field: "title" | "content", value: string) => {
    await updateDoc(doc(db, "notes", id), { [field]: value });
  };

  const changeColor = async (id: string, color: string) => {
    await updateDoc(doc(db, "notes", id), { color });
  };

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((n) => n.pinned);
  const others = filtered.filter((n) => !n.pinned);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <a href="/" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors" title={t("backToHome")}>
              <ArrowLeft className="w-4 h-4" />
            </a>
            <span className="font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="hidden sm:inline text-base">{t("notesAppName")}</span>
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 sm:px-4 py-2 min-w-0">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              className="flex-1 min-w-0 bg-transparent text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 outline-none"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        <NewNoteInput onCreate={createNote} />

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-zinc-400 dark:text-zinc-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{t("loadingNotes")}</span>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-8 w-full">
            {pinned.length > 0 && (
              <section>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-3 px-1">
                  📌 {t("pinned")}
                </p>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                  {pinned.map((note) => (
                    <div key={note.id} className="break-inside-avoid">
                      <NoteCard note={note} onDelete={deleteNote} onTogglePin={togglePin} onUpdate={updateNote} onColorChange={changeColor} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-3 px-1">
                    {t("otherNotes")}
                  </p>
                )}
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                  {others.map((note) => (
                    <div key={note.id} className="break-inside-avoid">
                      <NoteCard note={note} onDelete={deleteNote} onTogglePin={togglePin} onUpdate={updateNote} onColorChange={changeColor} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <FileX className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                </div>
                <p className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">
                  {search ? t("noNotesMatch") : t("noNotesYet")}
                </p>
                <p className="text-sm text-zinc-400 dark:text-zinc-600">
                  {search ? t("tryDifferentKeyword") : t("clickTakeNoteAbove")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
