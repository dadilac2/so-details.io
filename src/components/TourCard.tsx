import type { Tour } from "@/lib/tours-data";

export function TourCard({ tour, onClick }: { tour: Tour; onClick: () => void }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/?tour=${tour.id}`
      : `/?tour=${tour.id}`;
  return (
    <button
      onClick={onClick}
      id={`tour-${tour.id}`}
      data-tour-id={tour.id}
      data-tour-name={tour.title}
      data-tour-price={tour.price}
      data-tour-currency="RUB"
      data-tour-url={url}
      data-tour-image={tour.image}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card text-left shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-glow)] focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">
          {tour.short}
        </span>
        <h3 className="text-xl font-semibold text-foreground">{tour.title}</h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-2xl font-bold text-foreground">
            {tour.price.toLocaleString("ru-RU")} ₽
          </span>
          <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Подробнее →
          </span>
        </div>
      </div>
    </button>
  );
}