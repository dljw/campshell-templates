import type { ServerMessage } from "@campshell/core";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "./useWebSocket.js";

// --- Mock WebSocket ---

type WSEventHandler = (event: { data: string } | { code: number } | Event) => void;

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  // Test helpers
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }

  simulateMessage(data: ServerMessage) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  simulateClose(code = 1000) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code });
  }

  simulateError() {
    this.onerror?.(new Event("error"));
  }
}

// Assign static constants to prototype for readyState comparisons
Object.defineProperty(MockWebSocket, "OPEN", { value: 1 });

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function latestWs(): MockWebSocket {
  return MockWebSocket.instances[MockWebSocket.instances.length - 1];
}

describe("useWebSocket", () => {
  it("connects to default URL on mount", () => {
    renderHook(() => useWebSocket({ template: "kanban" }));
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(latestWs().url).toBe("ws://localhost:3000/ws");
  });

  it("connects to custom URL when provided", () => {
    renderHook(() => useWebSocket({ template: "kanban", url: "ws://example.com:5000" }));
    expect(latestWs().url).toBe("ws://example.com:5000");
  });

  it("status is 'connecting' initially", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    expect(result.current.status).toBe("connecting");
  });

  it("status transitions to 'connected' on open", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());
    expect(result.current.status).toBe("connected");
  });

  it("status transitions to 'disconnected' on close", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());
    expect(result.current.status).toBe("connected");
    act(() => latestWs().simulateClose());
    expect(result.current.status).toBe("disconnected");
  });

  it("writeFile sends correct ClientMessage JSON", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    act(() => result.current.writeFile("cards/abc.json", { id: "abc", title: "Test" }));

    expect(latestWs().send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "file:write",
        template: "kanban",
        file: "cards/abc.json",
        data: { id: "abc", title: "Test" },
      }),
    );
  });

  it("deleteFile sends correct ClientMessage JSON", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    act(() => result.current.deleteFile("cards/abc.json"));

    expect(latestWs().send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "file:delete",
        template: "kanban",
        file: "cards/abc.json",
      }),
    );
  });

  it("writeFile is a no-op when disconnected and returns false", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    // Don't open — status is "connecting", readyState is CONNECTING
    let sent = false;
    act(() => {
      sent = result.current.writeFile("cards/abc.json", {});
    });
    expect(latestWs().send).not.toHaveBeenCalled();
    expect(sent).toBe(false);
  });

  it("writeFile returns true when connected", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());
    let sent = false;
    act(() => {
      sent = result.current.writeFile("cards/abc.json", {});
    });
    expect(sent).toBe(true);
    expect(latestWs().send).toHaveBeenCalled();
  });

  it("deleteFile returns false when disconnected", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    let sent = false;
    act(() => {
      sent = result.current.deleteFile("cards/abc.json");
    });
    expect(latestWs().send).not.toHaveBeenCalled();
    expect(sent).toBe(false);
  });

  it("onFileEvent callback receives parsed server messages", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    const callback = vi.fn();
    act(() => {
      result.current.onFileEvent(callback);
    });

    const msg: ServerMessage = {
      type: "file:created",
      template: "kanban",
      entity: "card",
      file: "cards/abc.json",
      data: { id: "abc" },
      source: "agent",
    };
    act(() => latestWs().simulateMessage(msg));

    expect(callback).toHaveBeenCalledWith(msg);
  });

  it("onFileEvent returns unsubscribe function", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    const callback = vi.fn();
    let unsub: () => void;
    act(() => {
      unsub = result.current.onFileEvent(callback);
    });

    act(() => unsub());

    const msg: ServerMessage = {
      type: "file:created",
      template: "kanban",
      entity: "card",
      file: "cards/abc.json",
      data: {},
      source: "agent",
    };
    act(() => latestWs().simulateMessage(msg));

    expect(callback).not.toHaveBeenCalled();
  });

  it("filters messages by template", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    const callback = vi.fn();
    act(() => {
      result.current.onFileEvent(callback);
    });

    // Message for a different template
    const msg: ServerMessage = {
      type: "file:created",
      template: "calendar",
      entity: "event",
      file: "events/e1.json",
      data: {},
      source: "agent",
    };
    act(() => latestWs().simulateMessage(msg));

    expect(callback).not.toHaveBeenCalled();
  });

  it("accumulates validation errors", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    const errMsg: ServerMessage = {
      type: "validation:error",
      template: "kanban",
      file: "cards/bad.json",
      errors: [
        {
          keyword: "required",
          message: "must have required property 'title'",
          instancePath: "",
          schemaPath: "#/required",
          params: { missingProperty: "title" },
        },
      ],
    };
    act(() => latestWs().simulateMessage(errMsg));

    expect(result.current.validationErrors).toHaveLength(1);
    expect(result.current.validationErrors[0].file).toBe("cards/bad.json");
  });

  it("clears validation errors for a file on successful event", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    // Add a validation error
    act(() =>
      latestWs().simulateMessage({
        type: "validation:error",
        template: "kanban",
        file: "cards/abc.json",
        errors: [
          { keyword: "required", message: "missing", instancePath: "", schemaPath: "", params: {} },
        ],
      }),
    );
    expect(result.current.validationErrors).toHaveLength(1);

    // Successful write clears it
    act(() =>
      latestWs().simulateMessage({
        type: "file:created",
        template: "kanban",
        entity: "card",
        file: "cards/abc.json",
        data: {},
        source: "ui",
      }),
    );
    expect(result.current.validationErrors).toHaveLength(0);
  });

  it("reconnects with exponential backoff", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    // First disconnect — should reconnect after 1s
    act(() => latestWs().simulateClose());
    expect(result.current.status).toBe("disconnected");
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(MockWebSocket.instances).toHaveLength(2);

    // Second disconnect — should reconnect after 2s
    act(() => latestWs().simulateClose());
    act(() => vi.advanceTimersByTime(1999));
    expect(MockWebSocket.instances).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(MockWebSocket.instances).toHaveLength(3);

    // Third disconnect — should reconnect after 4s
    act(() => latestWs().simulateClose());
    act(() => vi.advanceTimersByTime(3999));
    expect(MockWebSocket.instances).toHaveLength(3);
    act(() => vi.advanceTimersByTime(1));
    expect(MockWebSocket.instances).toHaveLength(4);
  });

  it("caps reconnection delay at 30s", () => {
    renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    // Build up backoff: 1s, 2s, 4s, 8s, 16s, then 32s→capped at 30s
    act(() => latestWs().simulateClose()); // schedule at 1s
    act(() => vi.advanceTimersByTime(1000));

    act(() => latestWs().simulateClose()); // schedule at 2s
    act(() => vi.advanceTimersByTime(2000));

    act(() => latestWs().simulateClose()); // schedule at 4s
    act(() => vi.advanceTimersByTime(4000));

    act(() => latestWs().simulateClose()); // schedule at 8s
    act(() => vi.advanceTimersByTime(8000));

    act(() => latestWs().simulateClose()); // schedule at 16s
    act(() => vi.advanceTimersByTime(16000));

    act(() => latestWs().simulateClose()); // schedule at 30s (capped from 32s)

    const countBefore = MockWebSocket.instances.length;
    act(() => vi.advanceTimersByTime(29999));
    expect(MockWebSocket.instances).toHaveLength(countBefore);
    act(() => vi.advanceTimersByTime(1));
    expect(MockWebSocket.instances).toHaveLength(countBefore + 1);
  });

  it("resets backoff on successful reconnect", () => {
    renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    // Disconnect twice to get to 2s backoff
    act(() => latestWs().simulateClose());
    act(() => vi.advanceTimersByTime(1000));
    act(() => latestWs().simulateClose());
    act(() => vi.advanceTimersByTime(2000));

    // Reconnect successfully — backoff should reset to 1s
    act(() => latestWs().simulateOpen());
    act(() => latestWs().simulateClose());

    const countBefore = MockWebSocket.instances.length;
    act(() => vi.advanceTimersByTime(999));
    expect(MockWebSocket.instances).toHaveLength(countBefore);
    act(() => vi.advanceTimersByTime(1));
    expect(MockWebSocket.instances).toHaveLength(countBefore + 1);
  });

  it("does not reconnect after unmount", () => {
    const { unmount } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());
    act(() => latestWs().simulateClose());

    unmount();
    act(() => vi.advanceTimersByTime(60000));

    // Only the initial connection
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("closes WebSocket on unmount", () => {
    const { unmount } = renderHook(() => useWebSocket({ template: "kanban" }));
    const ws = latestWs();
    act(() => ws.simulateOpen());

    unmount();
    expect(ws.close).toHaveBeenCalled();
  });

  it("handles malformed server messages gracefully", () => {
    const { result } = renderHook(() => useWebSocket({ template: "kanban" }));
    act(() => latestWs().simulateOpen());

    const callback = vi.fn();
    act(() => {
      result.current.onFileEvent(callback);
    });

    // Send invalid JSON
    act(() => latestWs().onmessage?.({ data: "not json{" }));

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.status).toBe("connected");
  });
});
