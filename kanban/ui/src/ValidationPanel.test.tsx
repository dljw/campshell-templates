import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationPanel } from "./ValidationPanel";
import type { ValidationErrorDetail } from "./types";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) })),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeError(file: string, opts: Partial<ValidationErrorDetail> = {}): ValidationErrorDetail {
  return {
    template: "kanban",
    file,
    errors: [
      {
        keyword: "type",
        message: "must be string",
        instancePath: "/title",
        params: { type: "string" },
      },
    ],
    ...opts,
  };
}

describe("ValidationPanel", () => {
  it("renders nothing when errors is empty", () => {
    const { container } = render(
      <ValidationPanel errors={[]} selectedFile={null} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders error count in header", () => {
    const errors = [makeError("cards/a.json"), makeError("cards/b.json")];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText("Validation Errors (2)")).toBeDefined();
  });

  it("renders file path for each error", () => {
    const errors = [makeError("cards/bad.json")];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText("cards/bad.json")).toBeDefined();
  });

  it("renders field path and error message", () => {
    const errors = [makeError("cards/bad.json")];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText("/title")).toBeDefined();
    expect(screen.getByText("must be string")).toBeDefined();
  });

  it("shows '/' when instancePath is empty", () => {
    const errors = [
      makeError("cards/bad.json", {
        errors: [
          {
            keyword: "required",
            message: "must have required property",
            instancePath: "",
          },
        ],
      }),
    ];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText("/")).toBeDefined();
  });

  it("renders rejected data as formatted JSON", () => {
    const errors = [
      makeError("cards/bad.json", {
        rejectedData: { title: 123, id: "abc" },
      }),
    ];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText("Rejected data:")).toBeDefined();
    const pre = screen.getByText(/\"title\": 123/);
    expect(pre).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    const errors = [makeError("cards/bad.json")];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={onClose} />);
    screen.getByLabelText("Close panel").click();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const errors = [makeError("cards/bad.json")];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={onClose} />);
    screen.getByRole("presentation").click();
    expect(onClose).toHaveBeenCalled();
  });

  it("highlights the selected file section", () => {
    const errors = [makeError("cards/a.json"), makeError("cards/b.json")];
    const { container } = render(
      <ValidationPanel errors={errors} selectedFile="cards/b.json" onClose={vi.fn()} />,
    );
    const selected = container.querySelectorAll(".kb-panel-section--selected");
    expect(selected).toHaveLength(1);
  });

  it("calls onClose when selected error is resolved", () => {
    const onClose = vi.fn();
    const errors = [makeError("cards/bad.json")];
    const { rerender } = render(
      <ValidationPanel errors={errors} selectedFile="cards/bad.json" onClose={onClose} />,
    );

    // Simulate error being cleared
    rerender(<ValidationPanel errors={[]} selectedFile="cards/bad.json" onClose={onClose} />);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders Expected value from params.type", () => {
    const errors = [
      makeError("cards/bad.json", {
        errors: [
          {
            keyword: "type",
            message: "must be string",
            instancePath: "/title",
            params: { type: "string" },
          },
        ],
        rejectedData: { title: 123 },
      }),
    ];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText("Expected: string")).toBeDefined();
  });

  it("renders Got value from rejectedData using instancePath", () => {
    const errors = [
      makeError("cards/bad.json", {
        errors: [
          {
            keyword: "type",
            message: "must be string",
            instancePath: "/title",
            params: { type: "string" },
          },
        ],
        rejectedData: { title: 123, id: "abc" },
      }),
    ];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText("Got: 123")).toBeDefined();
  });

  it("does not render Got when rejectedData is missing", () => {
    const errors = [makeError("cards/bad.json")];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.queryByText(/Got:/)).toBeNull();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    const errors = [makeError("cards/bad.json")];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={onClose} />);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("resolves Got value through JSON Pointer escapes (~0, ~1)", () => {
    const errors = [
      makeError("cards/bad.json", {
        errors: [
          {
            keyword: "type",
            message: "must be number",
            instancePath: "/a~1b",
            params: { type: "number" },
          },
        ],
        rejectedData: { "a/b": "wrong" },
      }),
    ];
    render(<ValidationPanel errors={errors} selectedFile={null} onClose={vi.fn()} />);
    expect(screen.getByText('Got: "wrong"')).toBeDefined();
  });
});
