const axios = require("axios");
const { predictBatch, getSentimentScore } = require("../utils/sentimentClient");

jest.mock("axios"); // mock axios globally

describe("sentimentClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return scores for batch of texts", async () => {
    axios.post.mockResolvedValueOnce({
      data: { positive: [0.9, 0.2] }
    });

    const texts = ["I love pizza", "I hate bugs"];
    const scores = await predictBatch(texts);

    expect(scores).toEqual([0.9, 0.2]);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/predict_batch$/),
      { texts },
      expect.any(Object)
    );
  });

  it("should use cache for repeated texts", async () => {
    // first call -> axios
    axios.post.mockResolvedValueOnce({ data: { positive: [0.8] } });
    const first = await predictBatch(["Great food"]);
    expect(first[0]).toBe(0.8);

    // second call -> should NOT call axios again
    const second = await predictBatch(["Great food"]);
    expect(second[0]).toBe(0.8);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("should fallback to 0.5 if API errors", async () => {
    axios.post.mockRejectedValueOnce(new Error("API down"));

    const scores = await predictBatch(["Something"]);
    expect(scores[0]).toBe(0.5);
  });

  it("should fill missing results with 0.5", async () => {
    // API returns fewer results than inputs
    axios.post.mockResolvedValueOnce({
      data: { positive: [0.7] }
    });

    const texts = ["One", "Two"];
    const scores = await predictBatch(texts);

    expect(scores).toEqual([0.7, 0.5]); // second result defaults
  });

  it("getSentimentScore should return single score", async () => {
    axios.post.mockResolvedValueOnce({
      data: { positive: [0.95] }
    });

    const score = await getSentimentScore("Amazing!");
    expect(score).toBe(0.95);
  });

  it("getSentimentScore should return 0.5 if error occurs", async () => {
    axios.post.mockRejectedValueOnce(new Error("Timeout"));

    const score = await getSentimentScore("Error case");
    expect(score).toBe(0.5);
  });
});
