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
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
      return {
        ok: false,
        message: "Telegram не настроен: проверьте подключение Telegram-коннектора",
      };
    }

    const text = `🆕 <b>Новая заявка</b>\n\n👤 Имя: <b>${escapeHtml(
      data.name,
    )}</b>\n📞 Телефон: <b>${escapeHtml(data.phone)}</b>\n🗺 Экскурсия: <b>${escapeHtml(
      data.tour,
    )}</b>`;

    if (chatId) {
      const result = await sendTelegramMessage(LOVABLE_API_KEY, TELEGRAM_API_KEY, chatId, text);
      if (result.ok) return { ok: true };
      console.error("Telegram error", result.status, result.body);
      if (!result.body.toLowerCase().includes("chat not found")) {
        return { ok: false, message: "Не удалось отправить заявку. Попробуйте позже или свяжитесь напрямую." };
      }
    }

    const discoveredChatId = await getLatestTelegramChatId(LOVABLE_API_KEY, TELEGRAM_API_KEY);
    if (discoveredChatId && discoveredChatId !== chatId) {
      const retry = await sendTelegramMessage(LOVABLE_API_KEY, TELEGRAM_API_KEY, discoveredChatId, text);
      if (retry.ok) return { ok: true };
      console.error("Telegram retry error", retry.status, retry.body);
    }

    return {
      ok: false,
      message: "Telegram-чат не найден. Откройте подключенного бота, отправьте ему любое сообщение и повторите заявку.",
    };
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