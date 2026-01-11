export type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "vitrine.notifications";
const EVENT_NAME = "vitrine:notifications";

function readNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as NotificationItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotifications(items: NotificationItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function addNotification(message: string) {
  if (typeof window === "undefined") return;
  const items = readNotifications();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const next = [
    {
      id,
      message,
      createdAt: new Date().toISOString(),
    },
    ...items,
  ];
  writeNotifications(next);
}

export function dismissNotification(id: string) {
  const items = readNotifications().filter((item) => item.id !== id);
  writeNotifications(items);
}

export function getNotifications() {
  return readNotifications();
}

export function subscribeNotifications(onChange: (items: NotificationItem[]) => void) {
  if (typeof window === "undefined") return () => undefined;

  function handleChange() {
    onChange(readNotifications());
  }

  window.addEventListener(EVENT_NAME, handleChange);
  window.addEventListener("storage", handleChange);
  return () => {
    window.removeEventListener(EVENT_NAME, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}
