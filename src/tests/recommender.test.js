const { buildRecommendations } = require("../utils/recommender");

describe("Restaurant Recommender", () => {
  const mockRestaurants = [
    {
      _id: "1",
      name: "Pizza Place",
      address: "123 Street",
      menu: [{ name: "Pizza" }, { name: "Pasta" }],
      location: { coordinates: [85.324, 27.7172] } // Kathmandu
    },
    {
      _id: "2",
      name: "Burger House",
      address: "456 Avenue",
      menu: [{ name: "Burger" }, { name: "Fries" }],
      location: { coordinates: [85.330, 27.7000] } // Nearby
    }
  ];

  const mockUser = {
    location: { coordinates: [85.325, 27.715] },
    orders: [
      {
        items: [{ restaurant: "1" }] // user has ordered from Pizza Place
      }
    ]
  };

  const mockReviews = [
    { restaurantId: "1", sentimentScore: 0.9 },
    { restaurantId: "2", sentimentScore: 0.4 }
  ];

  it("should return restaurants sorted by final score", () => {
    const results = buildRecommendations({
      restaurants: mockRestaurants,
      user: mockUser,
      reviews: mockReviews
    });

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBe(2);

    // Each result should have required fields
    results.forEach(r => {
      expect(r).toHaveProperty("restaurant");
      expect(r).toHaveProperty("contentScore");
      expect(r).toHaveProperty("sentimentScore");
      expect(r).toHaveProperty("distanceKm");
      expect(r).toHaveProperty("finalScore");
    });

    // Pizza Place has higher sentiment + past order similarity => should rank first
    expect(results[0].restaurant.name).toBe("Pizza Place");
  });

  it("should handle empty user orders gracefully", () => {
    const results = buildRecommendations({
      restaurants: mockRestaurants,
      user: { location: { coordinates: [85.325, 27.715] }, orders: [] },
      reviews: mockReviews
    });

    expect(results.length).toBe(2);
  });

  it("should handle missing sentiment data", () => {
    const results = buildRecommendations({
      restaurants: mockRestaurants,
      user: mockUser,
      reviews: [] // no reviews
    });

    results.forEach(r => {
      expect(r.sentimentScore).toBe(0);
    });
  });
});
