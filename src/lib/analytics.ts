export const YM_ID = "XXXXXXXX";

declare global {
  interface Window {
    ym?: (id: string | number, action: string, ...args: unknown[]) => void;
  }
}

export type YmGoal =
  | "SUBMIT_FORM"
  | "CLICK_PHONE"
  | "CLICK_TELEGRAM"
  | "CLICK_WHATSAPP";

export function ymGoal(goal: YmGoal) {
  if (typeof window === "undefined") return;
  try {
    window.ym?.(YM_ID, "reachGoal", goal);
  } catch {
    /* noop */
  }
}