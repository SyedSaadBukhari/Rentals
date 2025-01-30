import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
// import ListingCard from "../components/ListingCard";
import { setWishList } from "../redux/state";
import LoginPage from "./LoginPage";
import { setLogin } from "../redux/state";

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      user: (state = initialState.user) => state,
    },
    preloadedState: initialState,
  });
};

describe("LoginPage Component", () => {
  let store;
  let mockDispatch;

  beforeEach(() => {
    store = createMockStore({ user: null });
    store.dispatch = jest.fn();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

  test("renders login form correctly", () => {
    renderComponent();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("allows input changes", () => {
    renderComponent();
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("calls login function on submit", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ user: { id: "123" }, token: "token123" }),
      })
    );

    renderComponent();
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    expect(await screen.findByText("Login failed")).not.toBeInTheDocument();
    expect(store.dispatch).toHaveBeenCalledWith(
      setLogin({ user: { id: "123" }, token: "token123" })
    );
  });
});
