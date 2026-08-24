export interface RequestPollingOptions {
  refresh: () => void | Promise<void>;
  isSessionActive: () => boolean;
  intervalMs?: number;
  setIntervalFn?: typeof setInterval;
  clearIntervalFn?: typeof clearInterval;
  subscribeAppState?: (listener: (state: string) => void) => () => void;
}

export function startRequestPolling(options: RequestPollingOptions): { stop: () => void } {
  const intervalMs = options.intervalMs ?? 8000;
  const setIntervalFn = options.setIntervalFn ?? setInterval;
  const clearIntervalFn = options.clearIntervalFn ?? clearInterval;

  const tick = () => {
    if (options.isSessionActive()) {
      void options.refresh();
    }
  };

  const intervalId = setIntervalFn(tick, intervalMs);
  const unsubscribe = options.subscribeAppState?.((state) => {
    if (state === "active" && options.isSessionActive()) {
      void options.refresh();
    }
  });

  return {
    stop() {
      clearIntervalFn(intervalId);
      unsubscribe?.();
    },
  };
}
