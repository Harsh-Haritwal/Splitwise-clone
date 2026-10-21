import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

function BrokenPage() {
  throw new Error("Test crash");
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a fallback when a page crashes", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenPage />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reload page" }),
    ).toBeInTheDocument();
  });
});
