import hermitageImg from "@/assets/tour-hermitage.jpg";
import peterhofImg from "@/assets/tour-peterhof.jpg";
import kronstadtImg from "@/assets/tour-kronstadt.jpg";
import bridgesImg from "@/assets/tour-bridges.jpg";

export type Tour = {
  id: string;
  title: string;
  short: string;
  price: number;
  image: string;
  description: string;
  duration: string;
};

export const defaultTours: Tour[] = [
  {
    id: "hermitage",
    title: "Эрмитаж",
    short: "Музей • Дворец",
    price: 2500,
    image: hermitageImg,
    duration: "3 часа",
    description:
      "Экскурсия по главным залам Эрмитажа: Иорданская лестница, Павильонный зал, галерея Рафаэля, шедевры Леонардо и импрессионистов. Билеты включены.",
  },
  {
    id: "peterhof",
    title: "Петергоф",
    short: "Фонтаны • Парк",
    price: 3200,
    image: peterhofImg,
    duration: "6 часов",
    description:
      "Поездка в загородную резиденцию Петра I. Большой каскад, Самсон, аллеи Нижнего парка и Большой дворец. Трансфер от центра города включён.",
  },
  {
    id: "kronstadt",
    title: "Кронштадт",
    short: "Остров • Флот",
    price: 2800,
    image: kronstadtImg,
    duration: "5 часов",
    description:
      "Морская крепость Петра I: Никольский собор, форты, якорная площадь и панорама Финского залива. Поездка с гидом и трансфером.",
  },
  {
    id: "bridges",
    title: "Развод мостов",
    short: "Ночь • Нева",
    price: 1800,
    image: bridgesImg,
    duration: "2 часа",
    description:
      "Ночная прогулка на теплоходе по Неве с видом на разводные мосты. Шампанское, тёплый салон и лучшие точки съёмки.",
  },
];

const KEY = "spb_tours_v1";

export function loadTours(): Tour[] {
  if (typeof window === "undefined") return defaultTours;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultTours;
    const parsed = JSON.parse(raw) as Tour[];
    return Array.isArray(parsed) && parsed.length ? parsed : defaultTours;
  } catch {
    return defaultTours;
  }
}

export function saveTours(tours: Tour[]) {
  localStorage.setItem(KEY, JSON.stringify(tours));
  window.dispatchEvent(new Event("tours:updated"));
}