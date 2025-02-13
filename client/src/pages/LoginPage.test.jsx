import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "./LoginPage";
import userEvent from "@testing-library/user-event";

// Mock redux store and router
const mockStore = configureStore({
  reducer: {
    user: (state = null) => state,
  },
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderLoginPage = () => {
  render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </Provider>
  );
};

describe("LoginPage Component", () => {
  // Positive Test Cases
  describe("Positive Tests", () => {
    test("successfully logs in with valid credentials", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: { id: 1 }, token: "token" }),
        })
      );

      renderLoginPage();

      await userEvent.type(
        screen.getByPlaceholderText("Email"),
        "test@example.com"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Password"),
        "password123"
      );

      fireEvent.click(screen.getByText("LOG IN"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    test("renders all required form elements", () => {
      renderLoginPage();

      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(screen.getByText("LOG IN")).toBeInTheDocument();
      expect(
        screen.getByText("Don't have an account? Sign In Here")
      ).toBeInTheDocument();
    });

    test("allows user input in form fields", async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "password123");

      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });
  });

  // Negative Test Cases
  describe("Negative Tests", () => {
    test("displays error for invalid login attempt", async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error("Login failed")));

      const consoleSpy = jest.spyOn(console, "log");
      renderLoginPage();

      await userEvent.type(
        screen.getByPlaceholderText("Email"),
        "invalid@example.com"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Password"),
        "wrongpassword"
      );

      fireEvent.click(screen.getByText("LOG IN"));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Login failed",
          expect.any(String)
        );
      });
    });

    test("prevents form submission with empty fields", async () => {
      renderLoginPage();

      const submitButton = screen.getByText("LOG IN");
      fireEvent.click(submitButton);

      expect(screen.getByPlaceholderText("Email")).toBeInvalid();
      expect(screen.getByPlaceholderText("Password")).toBeInvalid();
    });

    test("validates email format", async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText("Email");
      await userEvent.type(emailInput, "invalidemail");

      expect(emailInput).toBeInvalid();
    });
  });
});
