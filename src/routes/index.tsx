import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { TourCard } from "@/components/TourCard";
import { TourModal } from "@/components/TourModal";
import { SiteFooter } from "@/components/SiteFooter";
import { TourJsonLd } from "@/components/TourJsonLd";
import { loadTours, type Tour } from "@/lib/tours-data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Экскурсии по Санкт-Петербургу — авторские маршруты с гидом" },
      {
        name: "description",
        content:
          "Бронирование экскурсий по Санкт-Петербургу: Эрмитаж, Петергоф, Кронштадт, развод мостов. Лицензированные гиды, мгновенное подтверждение.",
      },
    ],
  }),
});

function Index() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [active, setActive] = useState<Tour | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const loaded = loadTours();
    setTours(loaded);
    setOrigin(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get("tour");
    if (tourId) {
      const found = loaded.find((t) => t.id === tourId);
      if (found) setActive(found);
    }
    const refresh = () => setTours(loadTours());
    window.addEventListener("tours:updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("tours:updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <header className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 40%)" }} />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">Санкт-Петербург</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
            Экскурсии по<br />Санкт-Петербургу
          </h1>
          <p className="mt-5 max-w-xl text-lg opacity-90">
            Откройте город по-настоящему — авторские маршруты с лицензированными гидами и мгновенным бронированием.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Экскурсии</h2>
            <p className="mt-1 text-muted-foreground">Выберите маршрут и забронируйте за пару минут</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tours.map((t) => (
            <TourCard key={t.id} tour={t} onClick={() => setActive(t)} />
          ))}
        </div>
      </main>

      <SiteFooter />
      {active && <TourModal tour={active} onClose={() => setActive(null)} />}
      {tours.length > 0 && <TourJsonLd tours={tours} origin={origin} />}
    </div>
  );
}
