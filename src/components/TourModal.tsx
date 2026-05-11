import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, Phone, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Tour } from "@/lib/tours-data";
import { sendBooking } from "@/lib/booking.functions";
import { ymGoal } from "@/lib/analytics";

const PHONE = "+7 (999) 636-18-10";
const TG = "https://t.me/Piter_Tours";
const WA = "https://wa.me/79955913432";

export function TourModal({ tour, onClose }: { tour: Tour; onClose: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);
  const send = useServerFn(sendBooking);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Sync URL for shareable/ad-feed links
    const prev = window.location.search;
    const params = new URLSearchParams(prev);
    params.set("tour", tour.id);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      const p = new URLSearchParams(window.location.search);
      p.delete("tour");
      const qs = p.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    };
  }, [onClose, tour.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = "Укажите имя";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) errs.phone = "Минимум 10 цифр";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const result = await send({ data: { name: name.trim(), phone: phone.trim(), tour: tour.title } });
      if (result.ok) {
        ymGoal("SUBMIT_FORM");
        toast.success("Заявка отправлена, мы свяжемся с вами");
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-card shadow-[var(--shadow-glow)] sm:rounded-3xl animate-in slide-in-from-bottom-4 duration-300"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/90 text-foreground shadow-md backdrop-blur transition hover:bg-card"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="aspect-[16/9] w-full overflow-hidden sm:rounded-t-3xl">
          <img src={tour.image} alt={tour.title} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              {tour.short} • {tour.duration}
            </span>
            <h2 className="mt-1 text-3xl font-bold text-foreground">{tour.title}</h2>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">{tour.description}</p>
          <div className="flex items-center justify-between rounded-2xl bg-secondary p-4">
            <span className="text-sm text-muted-foreground">Стоимость</span>
            <span className="text-2xl font-bold text-foreground">
              {tour.price.toLocaleString("ru-RU")} ₽
            </span>
          </div>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-2xl bg-[image:var(--gradient-hero)] px-6 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-glow)] active:scale-[0.99]"
            >
              Забронировать
            </button>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  maxLength={80}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Номер телефона"
                  inputMode="tel"
                  maxLength={20}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[image:var(--gradient-hero)] px-6 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-glow)] disabled:opacity-60"
              >
                {loading ? "Отправляем…" : "Отправить заявку"}
              </button>
            </form>
          )}

          <div className="space-y-2 border-t border-border pt-5">
            <p className="text-sm font-medium text-foreground">Или свяжитесь напрямую:</p>
            <div className="flex flex-wrap gap-2">
              <a onClick={() => ymGoal("CLICK_PHONE")} href={`tel:${PHONE.replace(/\s|\(|\)|-/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
                <Phone className="h-4 w-4" /> {PHONE}
              </a>
              <a onClick={() => ymGoal("CLICK_TELEGRAM")} href={TG} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
                <Send className="h-4 w-4" /> Telegram
              </a>
              <a onClick={() => ymGoal("CLICK_WHATSAPP")} href={WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-accent">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}