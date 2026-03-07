// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import { SignInForm } from "@/app/auth/signin/SignInForm";

const mockSignIn = vi.fn();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as { location?: unknown }).location;
    (window as { location: { href: string } }).location = { href: "" };
  });

  afterEach(() => {
    cleanup();
  });

  it("renders email input and submit button", () => {
    render(<SignInForm />);

    expect(screen.getByLabelText("Email address")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Sign in with email" })
    ).toBeDefined();
  });

  it("shows subscribe link", () => {
    render(<SignInForm />);

    expect(screen.getByText("Subscribe")).toBeDefined();
  });

  it("shows callbackUrl context when provided", () => {
    render(<SignInForm callbackUrl="/archive" />);

    expect(
      screen.getByText("Sign in to access this content.")
    ).toBeDefined();
  });

  it("does not show callbackUrl context for homepage", () => {
    render(<SignInForm callbackUrl="/" />);

    expect(
      screen.queryByText("Sign in to access this content.")
    ).toBeNull();
  });

  it("validates email format before submission", async () => {
    render(<SignInForm />);

    const input = screen.getByLabelText("Email address");

    await act(async () => {
      fireEvent.change(input, { target: { value: "not-an-email" } });
    });

    const form = input.closest("form")!;

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByRole("alert").textContent).toContain(
      "Please enter a valid email address"
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("calls signIn with email on valid submission", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    render(<SignInForm callbackUrl="/archive" />);

    const input = screen.getByLabelText("Email address");
    const button = screen.getByRole("button", { name: "Sign in with email" });

    await act(async () => {
      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("resend", {
        email: "test@example.com",
        callbackUrl: "/archive",
        redirect: false,
      });
    });
  });

  it("redirects to verify page on successful submission", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    render(<SignInForm />);

    const input = screen.getByLabelText("Email address");
    const button = screen.getByRole("button", { name: "Sign in with email" });

    await act(async () => {
      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(window.location.href).toBe("/auth/verify");
    });
  });

  it("shows error when signIn fails", async () => {
    mockSignIn.mockResolvedValue({ error: "AccessDenied" });

    render(<SignInForm />);

    const input = screen.getByLabelText("Email address");
    const button = screen.getByRole("button", { name: "Sign in with email" });

    await act(async () => {
      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "Unable to send magic link"
      );
    });
  });

  it("shows error when signIn throws", async () => {
    mockSignIn.mockRejectedValue(new Error("Network error"));

    render(<SignInForm />);

    const input = screen.getByLabelText("Email address");
    const button = screen.getByRole("button", { name: "Sign in with email" });

    await act(async () => {
      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "Something went wrong"
      );
    });
  });

  it("shows loading state during submission", async () => {
    let resolveSignIn: (value: unknown) => void;
    mockSignIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      })
    );

    render(<SignInForm />);

    const input = screen.getByLabelText("Email address");
    const button = screen.getByRole("button", { name: "Sign in with email" });

    await act(async () => {
      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);
    });

    expect(
      screen.getByRole("button", { name: "Sending magic link..." })
    ).toBeDefined();

    await act(async () => {
      resolveSignIn!({ error: null });
    });
  });
});
