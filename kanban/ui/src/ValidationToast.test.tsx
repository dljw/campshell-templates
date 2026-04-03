import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationToast } from "./ValidationToast";
import type { ValidationErrorDetail } from "./types";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function makeError(file: string, message = "must be string"): ValidationErrorDetail {
  return {
    template: "kanban",
    file,
    errors: [
      {
        keyword: "type",
        message,
        instancePath: "/title",
        params: { type: "string" },
      },
    ],
  };
}

describe("ValidationToast", () => {
  it("renders nothing when toasts is empty", () => {
    const { container } = render(
      <ValidationToast toasts={[]} onView={vi.fn()} onDismiss={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders a toast with template name, file, and error summary", () => {
    const error = makeError("cards/bad.json");
    render(<ValidationToast toasts={[error]} onView={vi.fn()} onDismiss={vi.fn()} />);

    expect(screen.getByText(/Validation Error/)).toBeDefined();
    expect(screen.getByText(/kanban/)).toBeDefined();
    expect(screen.getByText(/cards\/bad\.json/)).toBeDefined();
    expect(screen.getByText(/must be string/)).toBeDefined();
  });

  it("calls onView with file path when View is clicked", () => {
    const onView = vi.fn();
    const error = makeError("cards/bad.json");
    render(<ValidationToast toasts={[error]} onView={onView} onDismiss={vi.fn()} />);

    screen.getByText("View").click();
    expect(onView).toHaveBeenCalledWith("cards/bad.json");
  });

  it("calls onDismiss with file path when close is clicked", () => {
    const onDismiss = vi.fn();
    const error = makeError("cards/bad.json");
    render(<ValidationToast toasts={[error]} onView={vi.fn()} onDismiss={onDismiss} />);

    screen.getByLabelText("Dismiss").click();
    expect(onDismiss).toHaveBeenCalledWith("cards/bad.json");
  });

  it("auto-dismisses after 8 seconds", () => {
    const onDismiss = vi.fn();
    const error = makeError("cards/bad.json");
    render(<ValidationToast toasts={[error]} onView={vi.fn()} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(7999));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledWith("cards/bad.json");
  });

  it("shows at most 3 toasts", () => {
    const errors = [
      makeError("cards/1.json"),
      makeError("cards/2.json"),
      makeError("cards/3.json"),
      makeError("cards/4.json"),
    ];
    render(<ValidationToast toasts={errors} onView={vi.fn()} onDismiss={vi.fn()} />);

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(3);
  });

  it("does not reset timer for existing toast when new toast arrives", () => {
    const onDismiss = vi.fn();
    const error1 = makeError("cards/first.json");
    const { rerender } = render(
      <ValidationToast toasts={[error1]} onView={vi.fn()} onDismiss={onDismiss} />,
    );

    // Advance 5 seconds
    act(() => vi.advanceTimersByTime(5000));
    expect(onDismiss).not.toHaveBeenCalled();

    // Add a second toast — first timer should NOT reset
    const error2 = makeError("cards/second.json");
    rerender(<ValidationToast toasts={[error1, error2]} onView={vi.fn()} onDismiss={onDismiss} />);

    // After 3 more seconds (total 8s for first toast), first should dismiss
    act(() => vi.advanceTimersByTime(3000));
    expect(onDismiss).toHaveBeenCalledWith("cards/first.json");
    expect(onDismiss).not.toHaveBeenCalledWith("cards/second.json");

    // Second toast should dismiss after its own 8s (5 more seconds from now)
    act(() => vi.advanceTimersByTime(5000));
    expect(onDismiss).toHaveBeenCalledWith("cards/second.json");
  });

  it("renders multiple toasts for different files", () => {
    const errors = [
      makeError("cards/a.json", "missing title"),
      makeError("cards/b.json", "invalid type"),
    ];
    render(<ValidationToast toasts={errors} onView={vi.fn()} onDismiss={vi.fn()} />);

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
  });
});
