import { afterEach, describe, expect, it, vi } from "vitest";
import { startRequestPolling } from "./request-polling";

describe("startRequestPolling", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("chama refresh no intervalo quando ha sessao", () => {
    vi.useFakeTimers();
    const refresh = vi.fn();
    const handle = startRequestPolling({
      refresh,
      isSessionActive: () => true,
      intervalMs: 8000,
    });

    expect(refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(8000);
    expect(refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(8000);
    expect(refresh).toHaveBeenCalledTimes(2);
    handle.stop();
  });

  it("nao chama refresh no intervalo sem sessao", () => {
    vi.useFakeTimers();
    const refresh = vi.fn();
    const handle = startRequestPolling({
      refresh,
      isSessionActive: () => false,
      intervalMs: 8000,
    });

    vi.advanceTimersByTime(16000);
    expect(refresh).not.toHaveBeenCalled();
    handle.stop();
  });

  it("chama refresh quando o app volta para active", () => {
    const refresh = vi.fn();
    let listener: ((state: string) => void) | undefined;
    const handle = startRequestPolling({
      refresh,
      isSessionActive: () => true,
      subscribeAppState: (next) => {
        listener = next;
        return () => {
          listener = undefined;
        };
      },
    });

    listener?.("background");
    expect(refresh).not.toHaveBeenCalled();
    listener?.("active");
    expect(refresh).toHaveBeenCalledTimes(1);
    handle.stop();
  });

  it("stop cancela intervalo e o listener", () => {
    vi.useFakeTimers();
    const refresh = vi.fn();
    let listener: ((state: string) => void) | undefined;
    const handle = startRequestPolling({
      refresh,
      isSessionActive: () => true,
      intervalMs: 8000,
      subscribeAppState: (next) => {
        listener = next;
        return () => {
          listener = undefined;
        };
      },
    });

    handle.stop();
    vi.advanceTimersByTime(8000);
    listener?.("active");
    expect(refresh).not.toHaveBeenCalled();
  });
});
