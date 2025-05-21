import { User } from "../../../models/User.js";
import express from "express";
import { createUser, getAllUser } from "./controllers/usersControllers.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authUser from "../../../middleware/auth.js";

const router = express.Router();

//get all users

router.get("/users", getAllUser);

//Create a user
router.post("/users", createUser);

//Update a user
router.patch("/users/:_id", async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.params._id,
      { $set: req.body },
      { new: true }
    );
    if (!updateUser) {
      res.status(404).send("Can't find user id");
    }
    res.json(updateUser);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to update user",
      details: err.message,
    });
  }
});

//Delete a note
router.delete("/users/:_id", async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params._id);
    if (!deleteUser) {
      res.status(404).send("Can't find user id");
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted", data: deleteUser });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to delete user",
      details: err.message,
    });
  }
});

// Register a new user
router.post("/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({
      error: true,
      message: "All fields required",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: true, message: "Email already in use." });
    }
    const user = new User({ fullName, email, password });
    await user.save();
    res.status(201).json({
      error: false,
      message: "User registered successfully!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//Login a user
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Email and password are required.",
    });
  }
  try {
    const user = await User.findOne({ email });
    console.log(user.password);
    console.log(password);
    if (!user) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({
      error: false,
      token,
      message: "Login succesful!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    res.status(500).json();
  }
});
export default router;

// Verify token
router.get("/auth/verify", (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: true, message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      error: false,
      userId: decoded.userId,
      message: "Token is valid",
    });
  } catch (err) {
    res.status(401).json({ error: true, message: "Invalid token" });
  }
});

// GET Current User Profile (protected route)
router.get("/auth/profile", authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    res.status(200).json({ error: false, user });
  } catch (err) {
    res.status(500).json({
      error: true,
      detail: err.message,
    });
  }
});

// LOGOUT
router.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});
