import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
  phone: z
    .string()
    .trim()
    .min(10, "Минимум 10 цифр")
    .max(20)
    .regex(/[\d+()\-\s]+/, "Некорректный номер"),
  tour: z.string().trim().min(1).max(120),
});

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

export const sendBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !chatId) {
      return {
        ok: false,
        message: "Telegram не настроен: проверьте подключение и TELEGRAM_ADMIN_CHAT_ID",
      };
    }

    const text = `🆕 <b>Новая заявка</b>\n\n👤 Имя: <b>${escapeHtml(
      data.name,
    )}</b>\n📞 Телефон: <b>${escapeHtml(data.phone)}</b>\n🗺 Экскурсия: <b>${escapeHtml(
      data.tour,
    )}</b>`;

    const res = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error("Telegram error", res.status, body);
      const isChatNotFound = body.toLowerCase().includes("chat not found");
      return {
        ok: false,
        message: isChatNotFound
          ? "Telegram-чат не найден. Напишите боту в Telegram и обновите TELEGRAM_ADMIN_CHAT_ID числовым chat_id."
          : "Не удалось отправить заявку. Попробуйте позже или свяжитесь напрямую.",
      };
    }
    return { ok: true };
  });

const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(40),
  password: z.string().min(1).max(80),
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => adminLoginSchema.parse(data))
  .handler(async ({ data }) => {
    const expectedPass = process.env.ADMIN_PASSWORD || "12345";
    const expectedUser = "admin";
    const ok =
      data.username === expectedUser && data.password === expectedPass;
    if (!ok) throw new Error("Неверный логин или пароль");
    return { ok: true, token: "ok" };
  });

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}