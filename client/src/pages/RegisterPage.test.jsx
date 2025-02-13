import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import userEvent from "@testing-library/user-event";

const mockCreateObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );
};

describe("RegisterPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("mock-url");
  });

  // Positive Test Cases
  describe("Positive Tests", () => {
    test("successfully registers with valid form data", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
        })
      );

      renderRegisterPage();

      await userEvent.type(screen.getByPlaceholderText(/First Name/i), "John");
      await userEvent.type(screen.getByPlaceholderText(/Last Name/i), "Doe");
      await userEvent.type(
        screen.getByPlaceholderText(/Email/i),
        "john@example.com"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/^Password/i),
        "password123"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Confirm Password/i),
        "password123"
      );

      const file = new File(["dummy content"], "profile.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/Upload Your Photo/i);
      await userEvent.upload(fileInput, file);

      const registerButton = screen.getByRole("button", { name: /REGISTER/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    test("displays uploaded profile image preview", async () => {
      renderRegisterPage();

      const file = new File(["dummy content"], "profile.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/Upload Your Photo/i);

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        const previewImage = screen
          .getAllByRole("img")
          .find((img) =>
            img.getAttribute("style")?.includes("max-width: 80px")
          );
        expect(previewImage).toBeInTheDocument();
        expect(previewImage).toHaveAttribute("src", "mock-url");
      });

      expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    });

    test("allows matching passwords", async () => {
      renderRegisterPage();

      await userEvent.type(
        screen.getByPlaceholderText(/^Password/i),
        "password123"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Confirm Password/i),
        "password123"
      );

      expect(
        screen.queryByText(/Passwords are not matched!/i)
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /REGISTER/i })
      ).not.toBeDisabled();
    });
  });

  // Negative Test Cases
  describe("Negative Tests", () => {
    test("displays error for mismatched passwords", async () => {
      renderRegisterPage();

      await userEvent.type(
        screen.getByPlaceholderText(/^Password/i),
        "password123"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Confirm Password/i),
        "password456"
      );

      expect(
        screen.getByText(/Passwords are not matched!/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /REGISTER/i })).toBeDisabled();
    });

    test("prevents registration with missing required fields", async () => {
      renderRegisterPage();

      const registerButton = screen.getByRole("button", { name: /REGISTER/i });
      fireEvent.click(registerButton);

      expect(screen.getByPlaceholderText(/First Name/i)).toBeInvalid();
      expect(screen.getByPlaceholderText(/Last Name/i)).toBeInvalid();
      expect(screen.getByPlaceholderText(/Email/i)).toBeInvalid();
      expect(screen.getByPlaceholderText(/^Password/i)).toBeInvalid();
      expect(screen.getByPlaceholderText(/Confirm Password/i)).toBeInvalid();
    });

    test("handles registration failure", async () => {
      const mockError = new Error("Registration failed");
      global.fetch = jest.fn(() => Promise.reject(mockError));

      const consoleSpy = jest.spyOn(console, "log");
      renderRegisterPage();

      await userEvent.type(screen.getByPlaceholderText(/First Name/i), "John");
      await userEvent.type(screen.getByPlaceholderText(/Last Name/i), "Doe");
      await userEvent.type(
        screen.getByPlaceholderText(/Email/i),
        "john@example.com"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/^Password/i),
        "password123"
      );
      await userEvent.type(
        screen.getByPlaceholderText(/Confirm Password/i),
        "password123"
      );

      const file = new File(["dummy content"], "profile.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/Upload Your Photo/i);
      await userEvent.upload(fileInput, file);

      const registerButton = screen.getByRole("button", { name: /REGISTER/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Registration failed",
          mockError.message
        );
      });
    });
  });
});
