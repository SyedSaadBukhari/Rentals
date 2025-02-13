import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ListingDetails from "./ListingDetails";
import userEvent from "@testing-library/user-event";

// Mock the Loader component since we're testing its presence
jest.mock("../components/Loader", () => () => (
  <div data-testid="loader">Loading...</div>
));
jest.mock("../components/Navbar", () => () => <div>Navbar</div>);
jest.mock("../components/Footer", () => () => <div>Footer</div>);

const mockStore = configureStore({
  reducer: {
    user: (state = { _id: "user123" }) => state,
  },
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ listingId: "listing123" }),
}));

const mockListing = {
  _id: "listing123",
  title: "Test Listing",
  creator: {
    _id: "host123",
    firstName: "John",
    lastName: "Doe",
    profileImagePath: "public/images/profile.jpg",
  },
  listingPhotoPaths: [
    "public/images/listing1.jpg",
    "public/images/listing2.jpg",
  ],
  type: "Apartment",
  city: "Test City",
  province: "Test Province",
  country: "Test Country",
  price: 100,
  description: "Test description",
  highlight: "Test highlight",
  highlightDesc: "Test highlight description",
  amenities: ["WiFi,TV,Kitchen"],
  guestCount: 2,
  bedroomCount: 1,
  bedCount: 1,
  bathroomCount: 1,
};

const renderListingDetails = () => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <ListingDetails />
      </BrowserRouter>
    </Provider>
  );
};

describe("ListingDetails Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Positive Test Cases
  describe("Positive Tests", () => {
    test("successfully loads and displays listing details", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockListing),
        })
      );

      renderListingDetails();

      expect(screen.getByTestId("loader")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(mockListing.title)).toBeInTheDocument();
      });

      expect(screen.getByText(mockListing.description)).toBeInTheDocument();
      expect(
        screen.getByText(
          `${mockListing.type} in ${mockListing.city}, ${mockListing.province}, ${mockListing.country}`
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `Hosted by ${mockListing.creator.firstName} ${mockListing.creator.lastName}`
        )
      ).toBeInTheDocument();

      const images = screen.getAllByAltText(/listing photo/i);
      expect(images).toHaveLength(mockListing.listingPhotoPaths.length);

      const profileImage = screen.getByAltText(/host profile/i);
      expect(profileImage).toHaveAttribute(
        "src",
        `http://localhost:3001/${mockListing.creator.profileImagePath.replace(
          "public",
          ""
        )}`
      );
    });

    test("allows date selection and booking submission", async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockListing),
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
          })
        );

      renderListingDetails();

      await waitFor(() => {
        expect(screen.getByText("BOOK NOW")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("BOOK NOW"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/user123/trips");
      });
    });
  });

  // Negative Test Cases
  describe("Negative Tests", () => {
    test("handles API error when loading listing details", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      global.fetch = jest.fn(() =>
        Promise.reject(new Error("Failed to fetch"))
      );

      renderListingDetails();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Fetch Listing Details Failed",
          "Failed to fetch"
        );
      });

      consoleSpy.mockRestore();
    });

    test("handles booking submission failure", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockListing),
          })
        )
        .mockImplementationOnce(() =>
          Promise.reject(new Error("Booking failed"))
        );

      renderListingDetails();

      await waitFor(() => {
        expect(screen.getByText("BOOK NOW")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("BOOK NOW"));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Submit Booking Failed.",
          "Booking failed"
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
