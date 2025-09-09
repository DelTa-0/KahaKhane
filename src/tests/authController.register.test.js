// tests/authController.register.test.js
const authController = require("../controllers/auth.controller");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

jest.mock("../models/user.model");
jest.mock("bcrypt");

describe("registerUser", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { email: "test@example.com", password: "pass123", fullname: "Test User" },
      flash: jest.fn(),
    };
    res = {
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should not register if user already exists", async () => {
    userModel.findOne.mockResolvedValue({ email: "test@example.com" });

    await authController.registerUser(req, res);

    expect(req.flash).toHaveBeenCalledWith("error_msg", "You already have an account");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should register a new user successfully", async () => {
    userModel.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashed_password");
    userModel.create.mockResolvedValue({ _id: "123", email: "test@example.com" });

    await authController.registerUser(req, res);

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith("pass123", "salt");
    expect(userModel.create).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "hashed_password",
      fullname: "Test User",
    });
    expect(req.flash).toHaveBeenCalledWith("success_msg", "User created successfully. Please login.");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should handle errors gracefully", async () => {
    userModel.findOne.mockRejectedValue(new Error("DB Error"));

    await authController.registerUser(req, res);

    expect(req.flash).toHaveBeenCalledWith("error_msg", "Registration failed. Please try again.");
    expect(res.redirect).toHaveBeenCalledWith("/register");
  });
});
