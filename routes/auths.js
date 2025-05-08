const express = require("express");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../Models/User");
const validator = require("email-validator");
const validatePassword = require("../config/comman");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw createError(400, "Email and password required");

    if (!validator.validate(email)) throw createError(404, "Email not valid");

    if (!validatePassword(password))
      throw createError(404, "password not valid");

    const existingUser = await User.findOne({ email });
    if (existingUser) throw createError(409, "Email already in use");

    const newUser = new User({ email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError(400, "Missing credentials");

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, "Invalid email or password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
