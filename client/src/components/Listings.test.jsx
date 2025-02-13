import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { MemoryRouter } from "react-router-dom";
import Listings from "./Listings";
import { setListings } from "../redux/state";

jest.mock("../data", () => ({
  categories: [
    { label: "All", icon: "🏠" },
    { label: "Apartments", icon: "🏢" },
  ],
}));

global.fetch = jest.fn();

const initialState = {
  listings: [],
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_LISTINGS":
      return { ...state, listings: action.payload.listings };
    default:
      return state;
  }
};

const store = createStore(rootReducer);

describe("Listings Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(setListings({ listings: [] }));
  });

  //  Positive Tests
  test("Clicking a category filters the listings correctly", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ _id: "1", category: "Apartments", price: 200 }],
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Listings />
        </MemoryRouter>
      </Provider>
    );

    const categoryButton = screen.getByTestId("category-Apartments");
    fireEvent.click(categoryButton);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/properties?category=Apartments",
        { method: "GET" }
      )
    );
  });

  test("Displays loader while fetching listings", async () => {
    global.fetch.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Listings />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  test("Displays listings when data is successfully fetched", async () => {
    const mockListing = {
      _id: "1",
      city: "New York",
      category: "Apartment",
      price: 200,
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockListing],
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Listings />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("listing-card-1")).toBeInTheDocument();
    });
  });

  // Negative Tests
  test("Fetch fails due to network error and logs an error", async () => {
    console.log = jest.fn();
    global.fetch.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Listings />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() =>
      expect(console.log).toHaveBeenCalledWith(
        "Fetch Listings Failed",
        "Network Error"
      )
    );
  });

  test("No listings available for the selected category", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Listings />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("listing-card")).not.toBeInTheDocument();
    });
  });

  test("Clicking a category does not update listings when state is not updated", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Listings />
        </MemoryRouter>
      </Provider>
    );

    const categoryButton = screen.getByTestId("category-Apartments");
    fireEvent.click(categoryButton);

    await waitFor(() => {
      expect(screen.queryByTestId("listing-card-1")).not.toBeInTheDocument();
    });
  });
});
