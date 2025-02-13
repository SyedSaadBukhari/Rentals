import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CreateListing from "./CreateListing";
import userEvent from "@testing-library/user-event";

jest.mock("../components/Navbar", () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar</div>;
  };
});

jest.mock("../components/Footer", () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">Footer</div>;
  };
});

jest.mock("../data", () => ({
  categories: [
    { label: "Beach", icon: "🏖" },
    { label: "Mountain", icon: "⛰" },
  ],
  types: [
    { name: "Entire Place", description: "Whole place", icon: "🏠" },
    { name: "Private Room", description: "Private room", icon: "🛏" },
  ],
  facilities: [
    { name: "Wifi", icon: "📶" },
    { name: "Kitchen", icon: "🍳" },
  ],
}));

const mockStore = configureStore({
  reducer: {
    user: (state = { _id: "user123" }) => state,
  },
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

URL.createObjectURL = jest.fn(() => "mocked-url");

const renderCreateListing = () => {
  render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <CreateListing />
      </BrowserRouter>
    </Provider>
  );
};

describe("CreateListing Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    URL.createObjectURL = jest.fn(() => "http://mocked-url.com/image.jpg");
  });

  // Positive Test Cases
  describe("Positive Tests", () => {
    test("successfully creates listing with complete form data", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
        })
      );

      renderCreateListing();

      const beachCategory = screen.getByText("Beach");
      fireEvent.click(beachCategory);

      const entirePlace = screen.getByText("Entire Place");
      fireEvent.click(entirePlace);

      await userEvent.type(
        screen.getByPlaceholderText("Street Address"),
        "123 Test St"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Apt, Suite, etc. (if applicable)"),
        "Apt 4B"
      );
      await userEvent.type(screen.getByPlaceholderText("City"), "Test City");
      await userEvent.type(
        screen.getByPlaceholderText("Province"),
        "Test Province"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Country"),
        "Test Country"
      );

      const wifiAmenity = screen.getByText("Wifi");
      fireEvent.click(wifiAmenity);

      await userEvent.type(
        screen.getByPlaceholderText("Title"),
        "Test Listing"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Description"),
        "Test Description"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Highlight"),
        "Test Highlight"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Highlight details"),
        "Test Highlight Details"
      );
      await userEvent.type(screen.getByPlaceholderText("100"), "100");

      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/Upload from your device/i);
      await userEvent.upload(fileInput, file);

      const submitButton = screen.getByText("CREATE YOUR LISTING");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    test("allows updating guest counts", async () => {
      renderCreateListing();

      const increaseButtons = screen.getAllByTestId("AddCircleOutline");

      fireEvent.click(increaseButtons[0]);

      const guestCount = screen.getAllByText("2")[0];
      expect(guestCount).toBeInTheDocument();
    });

    test("successfully handles photo upload and preview", async () => {
      renderCreateListing();

      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/Upload from your device/i);

      await userEvent.upload(fileInput, file);

      const previewImage = screen.getByAltText("place");
      expect(previewImage).toBeInTheDocument();
      expect(previewImage.src).toBe("http://mocked-url.com/image.jpg");
    });
  });

  // Negative Test Cases
  describe("Negative Tests", () => {
    test("shows validation errors for missing required fields", async () => {
      renderCreateListing();

      const submitButton = screen.getByText("CREATE YOUR LISTING");
      fireEvent.click(submitButton);

      expect(screen.getByPlaceholderText("Street Address")).toBeInvalid();
      expect(screen.getByPlaceholderText("City")).toBeInvalid();
      expect(screen.getByPlaceholderText("Province")).toBeInvalid();
      expect(screen.getByPlaceholderText("Country")).toBeInvalid();
    });

    test("handles API error during listing creation", async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error("Failed to create listing"))
      );

      const consoleSpy = jest.spyOn(console, "log");
      renderCreateListing();

      await userEvent.type(
        screen.getByPlaceholderText("Street Address"),
        "123 Test St"
      );
      await userEvent.type(screen.getByPlaceholderText("City"), "Test City");
      await userEvent.type(
        screen.getByPlaceholderText("Province"),
        "Test Province"
      );
      await userEvent.type(
        screen.getByPlaceholderText("Country"),
        "Test Country"
      );

      const submitButton = screen.getByText("CREATE YOUR LISTING");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Publish Listing failed",
          expect.any(String)
        );
      });
    });

    test("prevents guest count from going below 1", async () => {
      renderCreateListing();

      const guestSection = screen.getByText("Guests").closest(".basic");
      const decreaseButton = guestSection.querySelector(
        '[data-testid="RemoveCircleOutline"]'
      );
      const guestCount = guestSection.querySelector("p:nth-child(2)");
      // Initial count  1
      expect(guestCount).toHaveTextContent("1");

      fireEvent.click(decreaseButton);

      expect(guestCount).toHaveTextContent("1");
    });

    test("successfully handles photo upload and preview", async () => {
      renderCreateListing();

      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/Upload from your device/i);

      await userEvent.upload(fileInput, file);

      const previewImage = screen.getByAltText("place");
      expect(previewImage).toBeInTheDocument();
      expect(previewImage.src).toBe("http://mocked-url.com/image.jpg");
    });
  });
});
