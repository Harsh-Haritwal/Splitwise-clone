import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider from "../context/AuthProvider";
import Login from "./Login";

const renderLogin = () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe("Login page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a validation message when the form is empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Please enter your email and password"),
    ).toBeInTheDocument();
  });

  it("shows the API error when login fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ msg: "Invalid email or password" }),
      }),
    );
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });
});
