import { User } from "../../../../models/User.js";

export const getAllUser = async (req, res) => {
  try {
    const user = await User.find();
    res.json({ error: false, user });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch users",
      detail: err.message,
    });
  }
};

export const createUser = async (req, res) => {
  const { username, password, name, email } = req.body;
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(409).json({
        error: true,
        message: "Email already in use",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        error: true,
        message: "Username must be between 3 and 30 characters",
      });
    }
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(409).json({
        error: true,
        message: "Username already in use",
      });
    }

    if (password.length < 6) {
      res.status(409).json({
        error: true,
        message: "Password at least 6 letter",
      });
    }

    //Create and save new user
    const user = new User({ username, password, name, email });
    await user.save();
    res.status(201).json({
      error: false,
      user,
      message: "Completed create new user",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      detail: err.message,
    });
  }
};
