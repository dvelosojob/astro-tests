import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/components/providers/LoginProvider", () => ({
  __esModule: true,
  LoginProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-login-provider">{children}</div>
  ),
}));

vi.mock("@/components/client/SignInForm", () => ({
  __esModule: true,
  SignInForm: () => <div data-testid="mock-signin-form" />,
}));

import SignIn from "./index";

describe("SignIn", () => {
  it("renders with mocks", async () => {
    render(<SignIn />);

    expect(screen.getByTestId("mock-login-provider")).toBeInTheDocument();
    expect(screen.getByTestId("mock-signin-form")).toBeInTheDocument();
  });
});
