import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Toaster, toast } from "sonner";
import { Pencil, Trash2, Plus, X, LogOut } from "lucide-react";
import { defaultTours, loadTours, saveTours, type Tour } from "@/lib/tours-data";
import { adminLogin } from "@/lib/booking.functions";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({ meta: [{ title: "Админ-панель" }, { name: "robots", content: "noindex" }] }),
});

const AUTH_KEY = "spb_admin_auth";

function Admin() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {!authed ? (
        <Login onSuccess={() => setAuthed(true)} />
      ) : (
        <Dashboard onLogout={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }} />
      )}
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useServerFn(adminLogin);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ data: { username: u.trim(), password: p } });
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-card p-8 shadow-[var(--shadow-soft)]">
        <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
        <p className="text-sm text-muted-foreground">Введите логин и пароль</p>
        <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Логин" className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <input value={p} onChange={(e) => setP(e.target.value)} type="password" placeholder="Пароль" className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <button disabled={loading} className="w-full rounded-2xl bg-[image:var(--gradient-hero)] px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-glow)] disabled:opacity-60">
          {loading ? "Входим…" : "Войти"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-primary">← На главную</Link>
      </form>
    </div>
  );
}

function emptyTour(): Tour {
  return { id: crypto.randomUUID(), title: "", short: "", price: 0, image: "", description: "", duration: "" };
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [editing, setEditing] = useState<Tour | null>(null);

  useEffect(() => { setTours(loadTours()); }, []);

  function persist(next: Tour[]) {
    saveTours(next);
    setTours(next);
  }

  function onSave(t: Tour) {
    const exists = tours.some((x) => x.id === t.id);
    persist(exists ? tours.map((x) => (x.id === t.id ? t : x)) : [...tours, t]);
    setEditing(null);
    toast.success("Сохранено");
  }

  function onDelete(id: string) {
    if (!confirm("Удалить экскурсию?")) return;
    persist(tours.filter((t) => t.id !== id));
  }

  function reset() {
    if (!confirm("Сбросить к стандартным экскурсиям?")) return;
    persist(defaultTours);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Экскурсии</h1>
          <p className="text-sm text-muted-foreground">Управление карточками на главной</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent">Открыть сайт</Link>
          <button onClick={reset} className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent">Сбросить</button>
          <button onClick={onLogout} className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent">
            <LogOut className="h-4 w-4" /> Выйти
          </button>
          <button onClick={() => setEditing(emptyTour())} className="inline-flex items-center gap-1 rounded-full bg-[image:var(--gradient-hero)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]">
            <Plus className="h-4 w-4" /> Добавить
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Фото</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Описание</th>
              <th className="px-4 py-3">Цена</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3">
                  {t.image ? <img src={t.image} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <div className="h-12 w-16 rounded-lg bg-muted" />}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{t.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.short}</td>
                <td className="px-4 py-3 font-semibold">{t.price.toLocaleString("ru-RU")} ₽</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditing(t)} className="grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(t.id)} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-destructive hover:bg-accent"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Нет экскурсий</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <Editor tour={editing} onSave={onSave} onClose={() => setEditing(null)} />}
    </div>
  );
}

function Editor({ tour, onSave, onClose }: { tour: Tour; onSave: (t: Tour) => void; onClose: () => void }) {
  const [t, setT] = useState<Tour>(tour);

  function set<K extends keyof Tour>(k: K, v: Tour[K]) {
    setT((p) => ({ ...p, [k]: v }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1280, 0.8);
      set("image", compressed);
    } catch {
      toast.error("Не удалось обработать изображение");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!t.title.trim()) return toast.error("Укажите название");
    if (t.price <= 0) return toast.error("Укажите цену");
    try {
      onSave(t);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка сохранения";
      if (/quota/i.test(msg)) {
        toast.error("Слишком большое изображение. Загрузите файл поменьше.");
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-6 shadow-[var(--shadow-glow)] sm:rounded-3xl sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-accent" aria-label="Закрыть">
          <X className="h-4 w-4" />
        </button>
        <h2 className="mb-5 text-xl font-bold text-foreground">{tour.title ? "Редактировать" : "Новая экскурсия"}</h2>
        <div className="space-y-3">
          <Field label="Название"><input value={t.title} onChange={(e) => set("title", e.target.value)} className={inputCls} /></Field>
          <Field label="Короткое описание (2-3 слова)"><input value={t.short} onChange={(e) => set("short", e.target.value)} className={inputCls} /></Field>
          <Field label="Длительность"><input value={t.duration} onChange={(e) => set("duration", e.target.value)} placeholder="3 часа" className={inputCls} /></Field>
          <Field label="Цена, ₽"><input type="number" value={t.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={inputCls} /></Field>
          <Field label="Полное описание"><textarea value={t.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls} /></Field>
          <Field label="Фото">
            <div className="space-y-2">
              {t.image && <img src={t.image} alt="" className="h-32 w-full rounded-2xl object-cover" />}
              <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-accent" />
              <input value={t.image} onChange={(e) => set("image", e.target.value)} placeholder="или вставьте URL" className={inputCls} />
            </div>
          </Field>
        </div>
        <button className="mt-6 w-full rounded-2xl bg-[image:var(--gradient-hero)] px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-glow)]">
          Сохранить
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

async function compressImage(file: File, maxSize = 1280, quality = 0.8): Promise<string> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("bad image"));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}