import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Navbar from "./Navbar";

// Mock Redux
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      user: (state = initialState.user) => state,
    },
    preloadedState: initialState,
  });
};

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

//  wrapper component
const renderWithProviders = (component, initialState = { user: null }) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("Navbar Component", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  // Test : Basic renderin
  test("renders logo and search bar", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByAltText("logo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search ...")).toBeInTheDocument();
  });

  // Test: Search function
  test("search button is disabled when search input is empty", () => {
    renderWithProviders(<Navbar />);

    const searchButton = screen.getByRole("button");
    expect(searchButton).toBeDisabled();
  });

  test("search button is enabled when search input has value", () => {
    renderWithProviders(<Navbar />);

    const searchInput = screen.getByPlaceholderText("Search ...");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    const searchButton = screen.getByRole("button");
    expect(searchButton).toBeEnabled();
  });

  test("navigates to search results when search button is clicked", () => {
    renderWithProviders(<Navbar />);

    const searchInput = screen.getByPlaceholderText("Search ...");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    const searchButton = screen.getByRole("button");
    fireEvent.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith("/properties/search/test search");
  });

  // Test : not logged in state
  test("shows login and signup links when user is not logged in", () => {
    renderWithProviders(<Navbar />);

    const accountButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(accountButton);

    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  // Test :  logged in state
  test("shows user menu items when logged in", () => {
    const mockUser = {
      _id: "123",
      profileImagePath: "public/images/profile.jpg",
    };

    renderWithProviders(<Navbar />, { user: mockUser });

    const accountButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(accountButton);

    expect(screen.getByText("Trip List")).toBeInTheDocument();
    expect(screen.getByText("Wish List")).toBeInTheDocument();
    expect(screen.getByText("Property List")).toBeInTheDocument();
    expect(screen.getByText("Reservation List")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  // Test : Become  Host link
  test("redirects to login when non-logged in user clicks Become A Host", () => {
    renderWithProviders(<Navbar />);

    const hostLink = screen.getByText("Become A Host");
    expect(hostLink.getAttribute("href")).toBe("/login");
  });

  test("redirects to create-listing when logged in user clicks Become A Host", () => {
    const mockUser = {
      _id: "123",
      profileImagePath: "public/images/profile.jpg",
    };
    renderWithProviders(<Navbar />, { user: mockUser });

    const hostLink = screen.getByText("Become A Host");
    expect(hostLink.getAttribute("href")).toBe("/create-listing");
  });

  // Test : Logout function
  test("dispatches logout action when logout is clicked", () => {
    const mockUser = {
      _id: "123",
      profileImagePath: "public/images/profile.jpg",
    };
    const { store } = renderWithProviders(<Navbar />, { user: mockUser });

    const accountButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(accountButton);

    const logoutLink = screen.getByText("Log Out");
    fireEvent.click(logoutLink);
  });
});
