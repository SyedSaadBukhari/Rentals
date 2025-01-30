import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import ListingCard from "../components/ListingCard";
import { setWishList } from "../redux/state";

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      user: (state = initialState.user) => state,
    },
    preloadedState: initialState,
  });
};

describe("ListingCard Component", () => {
  let store;
  let mockDispatch;

  beforeEach(() => {
    store = createMockStore({
      user: {
        _id: "user123",
        wishList: [{ _id: "listing123" }],
      },
    });
    store.dispatch = jest.fn();
  });

  const defaultProps = {
    listingId: "listing123",
    creator: { _id: "creator456" },
    listingPhotoPaths: ["photo1.jpg", "photo2.jpg"],
    city: "New York",
    province: "NY",
    country: "USA",
    category: "Apartment",
    type: "Rental",
    price: 200,
    startDate: "2024-06-01",
    endDate: "2024-06-05",
    totalPrice: 800,
    booking: false,
  };

  const renderComponent = (props = {}) =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ListingCard {...defaultProps} {...props} />
        </BrowserRouter>
      </Provider>
    );

  test("renders listing details correctly", () => {
    renderComponent();
    expect(screen.getByText(/New York, NY, USA/i)).toBeInTheDocument();
    expect(screen.getByText(/Apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/Rental/i)).toBeInTheDocument();
    expect(screen.getByText(/\$200 per night/i)).toBeInTheDocument();
  });

  test("navigates to property details page when clicked", () => {
    renderComponent();
    const card = screen.getByRole("button", { hidden: true });
    fireEvent.click(card);
    expect(global.window.location.pathname).toContain("/properties/listing123");
  });

  test("wishlist button toggles correctly", () => {
    renderComponent();
    const wishlistButton = screen.getByRole("button", { name: /favorite/i });
    fireEvent.click(wishlistButton);
    expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  test("slider navigation works", () => {
    renderComponent();
    const nextButton = screen.getByRole("button", {
      name: /arrow_forward_ios/i,
    });
    fireEvent.click(nextButton);
    w;
  });
});
