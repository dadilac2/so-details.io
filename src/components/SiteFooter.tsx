import { Phone, Send, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ymGoal } from "@/lib/analytics";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Экскурсии по СПб</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Авторские маршруты по Санкт-Петербургу с лицензированными гидами.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Контакты</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +7 (999) 636-18-10</li>
            <li>ежедневно с 9:00 до 21:00</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Соцсети</h4>
          <div className="mt-3 flex gap-2">
            <a onClick={() => ymGoal("CLICK_TELEGRAM")} href="https://t.me/Piter_Tours" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-card text-primary shadow-sm transition hover:bg-primary hover:text-primary-foreground">
              <Send className="h-4 w-4" />
            </a>
            <a onClick={() => ymGoal("CLICK_TELEGRAM")} href="https://t.me/Piter_Tours" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-card text-primary shadow-sm transition hover:bg-primary hover:text-primary-foreground">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
          <Link to="/admin" className="mt-4 inline-block text-xs text-muted-foreground hover:text-primary">
            Админ-панель
          </Link>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Экскурсии по Санкт-Петербургу
      </div>
    </footer>
  );
}