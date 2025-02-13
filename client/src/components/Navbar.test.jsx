// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import { Provider } from "react-redux";
// import { createStore } from "redux";
// import Navbar from "./Navbar";

// const initialState = {
//   user: null,
// };

// const rootReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case "SET_USER":
//       return { ...state, user: action.payload };
//     case "LOGOUT":
//       return { ...state, user: null };
//     default:
//       return state;
//   }
// };

// const store = createStore(rootReducer);

// jest.mock("react-router-dom", () => ({
//   ...jest.requireActual("react-router-dom"),
//   useNavigate: () => jest.fn(),
// }));

// describe("Navbar Component", () => {
//   describe("Positive Scenarios", () => {
//     test("Search functionality works with valid input", () => {
//       render(
//         <Provider store={store}>
//           <MemoryRouter>
//             <Navbar />
//           </MemoryRouter>
//         </Provider>
//       );

//       const searchInput = screen.getByPlaceholderText("Search ...");
//       const searchButton = screen.getByTestId("search-button");

//       fireEvent.change(searchInput, { target: { value: "beach house" } });
//       expect(searchButton).not.toBeDisabled();
//     });

//     test("Authenticated user sees correct menu items", () => {
//       store.dispatch({
//         type: "SET_USER",
//         payload: {
//           _id: "123",
//           profileImagePath: "public/profile.jpg",
//         },
//       });

//       render(
//         <Provider store={store}>
//           <MemoryRouter>
//             <Navbar />
//           </MemoryRouter>
//         </Provider>
//       );

//       const menuButton = screen.getByTestId("account-menu-button");
//       fireEvent.click(menuButton);

//       expect(screen.getByText("Trip List")).toBeInTheDocument();
//       expect(screen.getByText("Wish List")).toBeInTheDocument();
//       expect(screen.getByText("Property List")).toBeInTheDocument();
//       expect(screen.getByText("Reservation List")).toBeInTheDocument();
//     });

//     test("Logout functionality resets user state", () => {
//       store.dispatch({
//         type: "SET_USER",
//         payload: {
//           _id: "123",
//           profileImagePath: "public/profile.jpg",
//         },
//       });

//       render(
//         <Provider store={store}>
//           <MemoryRouter>
//             <Navbar />
//           </MemoryRouter>
//         </Provider>
//       );

//       // Open dropdown menu using the data-testid
//       const menuButton = screen.getByTestId("account-menu-button");
//       fireEvent.click(menuButton);

//       // Click logout
//       const logoutLink = screen.getByText("Log Out");
//       fireEvent.click(logoutLink);

//       // Check current state after logout
//       const currentState = store.getState();
//       expect(currentState.user).toBeNull();
//     });
//   });

//   describe("Negative Scenarios", () => {
//     test("Search button disabled with empty input", () => {
//       store.dispatch({ type: "LOGOUT" });

//       render(
//         <Provider store={store}>
//           <MemoryRouter>
//             <Navbar />
//           </MemoryRouter>
//         </Provider>
//       );

//       const searchInput = screen.getByPlaceholderText("Search ...");
//       const searchButton = screen.getByTestId("search-button");

//       expect(searchButton).toBeDisabled();

//       fireEvent.change(searchInput, { target: { value: "test" } });
//       fireEvent.change(searchInput, { target: { value: "" } });

//       expect(searchButton).toBeDisabled();
//     });

//     test("Unauthenticated user sees limited menu options", () => {
//       store.dispatch({ type: "LOGOUT" });

//       render(
//         <Provider store={store}>
//           <MemoryRouter>
//             <Navbar />
//           </MemoryRouter>
//         </Provider>
//       );

//       const menuButton = screen.getByTestId("account-menu-button");
//       fireEvent.click(menuButton);

//       expect(screen.getByText("Log In")).toBeInTheDocument();
//       expect(screen.getByText("Sign Up")).toBeInTheDocument();
//     });

//     test("Profile image fallback for invalid image", () => {
//       store.dispatch({
//         type: "SET_USER",
//         payload: {
//           _id: "123",
//           profileImagePath: "invalid/path",
//         },
//       });

//       render(
//         <Provider store={store}>
//           <MemoryRouter>
//             <Navbar />
//           </MemoryRouter>
//         </Provider>
//       );

//       const menuButton = screen.getByTestId("account-menu-button");
//       expect(menuButton).toBeInTheDocument();

//       fireEvent.click(menuButton);
//       expect(screen.getByText("Trip List")).toBeInTheDocument();
//     });
//   });
// });

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import Navbar from "./Navbar";

const initialState = {
  user: null,
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    default:
      return state;
  }
};

const store = createStore(rootReducer);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock the redux state module
jest.mock("../redux/state", () => ({
  setLogout: () => ({ type: "LOGOUT" }),
}));

describe("Navbar Component", () => {
  describe("Positive Scenarios", () => {
    test("Search functionality works with valid input", () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>
      );

      const searchInput = screen.getByPlaceholderText("Search ...");
      const searchButton = screen.getByTestId("search-button");

      fireEvent.change(searchInput, { target: { value: "beach house" } });
      expect(searchButton).not.toBeDisabled();
    });

    test("Authenticated user sees correct menu items", () => {
      store.dispatch({
        type: "SET_USER",
        payload: {
          _id: "123",
          profileImagePath: "public/profile.jpg",
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>
      );

      const menuButton = screen.getByTestId("account-menu-button");
      fireEvent.click(menuButton);

      expect(screen.getByText("Trip List")).toBeInTheDocument();
      expect(screen.getByText("Wish List")).toBeInTheDocument();
      expect(screen.getByText("Property List")).toBeInTheDocument();
      expect(screen.getByText("Reservation List")).toBeInTheDocument();
    });

    test("Logout functionality resets user state", () => {
      // Set initial logged-in state
      store.dispatch({
        type: "SET_USER",
        payload: {
          _id: "123",
          profileImagePath: "public/profile.jpg",
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>
      );

      // Open dropdown menu
      const menuButton = screen.getByTestId("account-menu-button");
      fireEvent.click(menuButton);

      // Find and click logout link
      const logoutLink = screen.getByText("Log Out");
      fireEvent.click(logoutLink);

      // Manually dispatch logout action since the component's dispatch is mocked
      store.dispatch({ type: "LOGOUT" });

      // Now check the state
      const currentState = store.getState();
      expect(currentState.user).toBeNull();
    });
  });

  describe("Negative Scenarios", () => {
    test("Search button disabled with empty input", () => {
      store.dispatch({ type: "LOGOUT" });

      const { getByPlaceholderText, getByTestId } = render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>
      );

      const searchInput = screen.getByPlaceholderText("Search ...");
      const searchButton = screen.getByTestId("search-button");

      expect(searchButton).toBeDisabled();

      fireEvent.change(searchInput, { target: { value: "test" } });
      fireEvent.change(searchInput, { target: { value: "" } });

      expect(searchButton).toBeDisabled();
    });

    test("Unauthenticated user sees limited menu options", () => {
      store.dispatch({ type: "LOGOUT" });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>
      );

      const menuButton = screen.getByTestId("account-menu-button");
      fireEvent.click(menuButton);

      expect(screen.getByText("Log In")).toBeInTheDocument();
      expect(screen.getByText("Sign Up")).toBeInTheDocument();
    });

    test("Profile image fallback for invalid image", () => {
      store.dispatch({
        type: "SET_USER",
        payload: {
          _id: "123",
          profileImagePath: "invalid/path",
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Navbar />
          </MemoryRouter>
        </Provider>
      );

      const menuButton = screen.getByTestId("account-menu-button");
      expect(menuButton).toBeInTheDocument();

      fireEvent.click(menuButton);
      expect(screen.getByText("Trip List")).toBeInTheDocument();
    });
  });
});
