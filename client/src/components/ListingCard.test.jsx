import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { MemoryRouter } from "react-router-dom";
import ListingCard from "./ListingCard";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ wishList: ["123"] }),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  })
);

const initialState = {
  user: null,
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "state/setWishList":
      return {
        ...state,
        user: {
          ...state.user,
          wishList: action.payload,
        },
      };
    default:
      return state;
  }
};

const store = createStore(rootReducer);

describe("ListingCard Component", () => {
  const mockProps = {
    listingId: "123",
    creator: { _id: "creator123" },
    listingPhotoPaths: [
      "public/photo1.jpg",
      "public/photo2.jpg",
      "public/photo3.jpg",
    ],
    city: "New York",
    province: "NY",
    country: "USA",
    category: "Apartment",
    type: "Entire Place",
    price: 100,
    startDate: "2025-03-01",
    endDate: "2025-03-05",
    totalPrice: 500,
    booking: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("User can navigate through listing photos using arrow buttons", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ListingCard {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    const nextButton = screen.getAllByTestId("next-slide-button")[0];
    const prevButton = screen.getAllByTestId("prev-slide-button")[0];
    const slider = screen.getByTestId("slider");

    // handle -0% case
    const getNormalizedTransform = (transform) =>
      transform.replace(/-0%/g, "0%");

    expect(getNormalizedTransform(slider.style.transform)).toBe(
      "translateX(0%)"
    );

    // Click next button
    fireEvent.click(nextButton);
    expect(getNormalizedTransform(slider.style.transform)).toBe(
      "translateX(-100%)"
    );

    // Click prev button
    fireEvent.click(prevButton);
    expect(getNormalizedTransform(slider.style.transform)).toBe(
      "translateX(0%)"
    );
  });

  test("Clicking listing card navigates to listing detail page", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ListingCard {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    const card = screen.getByTestId("listing-card");
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith("/properties/123");
  });

  test("Displays booking information when booking prop is true", () => {
    const bookingProps = {
      ...mockProps,
      booking: true,
    };

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ListingCard {...bookingProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("2025-03-01 - 2025-03-05")).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return element.textContent === "$500 total";
      })
    ).toBeInTheDocument();
  });

  test("Displays regular listing information when booking prop is false", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ListingCard {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Entire Place")).toBeInTheDocument();
    expect(
      screen.getByText((content, element) => {
        return element.textContent === "$100 per night";
      })
    ).toBeInTheDocument();
  });

  test("Wishlist button is disabled when user is not logged in", () => {
    // Ensure no user is logged in
    store.dispatch({
      type: "SET_USER",
      payload: null,
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ListingCard {...mockProps} />
        </MemoryRouter>
      </Provider>
    );

    const wishlistButton = screen.getByTestId("wishlist-button");
    expect(wishlistButton).toBeDisabled();
  });
});
