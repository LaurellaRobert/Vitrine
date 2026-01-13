export type CurrencySubscriber = (balance: number) => void;

const listeners = new Set<CurrencySubscriber>();

export function notifyCurrency(balance: number) {
  listeners.forEach((listener) => listener(balance));
}

export function subscribeCurrency(listener: CurrencySubscriber) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
