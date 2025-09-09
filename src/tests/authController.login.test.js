// tests/authController.login.test.js
const authController = require("../controllers/auth.controller");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../models/user.model");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("loginUser", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { email: "test@example.com", password: "pass123" },
      flash: jest.fn(),
    };
    res = {
      redirect: jest.fn(),
      cookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should fail if email or password missing", async () => {
    req.body = { email: "", password: "" };

    await authController.loginUser(req, res);

    expect(req.flash).toHaveBeenCalledWith("error_msg", "Enter email and password!");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should fail if user not found", async () => {
    userModel.findOne.mockResolvedValue(null);

    await authController.loginUser(req, res);

    expect(req.flash).toHaveBeenCalledWith("error_msg", "email or password incorrect");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should login successfully with valid credentials", async () => {
    const user = { _id: "123", email: "test@example.com", password: "hashed" };
    userModel.findOne.mockResolvedValue(user);
    bcrypt.compare.mockImplementation((pass, hash, cb) => cb(null, true));
    jwt.sign.mockReturnValue("fake_jwt");

    await authController.loginUser(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { email: user.email, id: user._id },
      process.env.JWT_KEY,
      { expiresIn: "30m" }
    );
    expect(res.cookie).toHaveBeenCalledWith("token", "fake_jwt");
    expect(req.flash).toHaveBeenCalledWith("success_msg", "You have successfully logged in!!");
    expect(res.redirect).toHaveBeenCalledWith("/");
  });

  it("should fail if password mismatch", async () => {
    const user = { _id: "123", email: "test@example.com", password: "hashed" };
    userModel.findOne.mockResolvedValue(user);
    bcrypt.compare.mockImplementation((pass, hash, cb) => cb(null, false));

    await authController.loginUser(req, res);

    expect(req.flash).toHaveBeenCalledWith("error_msg", "Email or password incorrect");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });

  it("should handle bcrypt error", async () => {
    const user = { _id: "123", email: "test@example.com", password: "hashed" };
    userModel.findOne.mockResolvedValue(user);
    bcrypt.compare.mockImplementation((pass, hash, cb) => cb(new Error("bcrypt fail")));

    await authController.loginUser(req, res);

    expect(req.flash).toHaveBeenCalledWith("error_msg", "Something went wrong");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });
});
