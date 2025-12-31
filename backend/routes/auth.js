const express = require("express");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();

/* ================= GOOGLE CLIENT ================= */
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, enrollment, adminCode } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      enrollment: role === "student" ? enrollment : "",
      adminCode: role === "admin" ? adminCode : "",
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❗ Google users won't have password
    if (!user.password) {
      return res.status(400).json({
        message: "Please login using Google",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      name: user.name,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

/* ================= GOOGLE LOGIN ================= */
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    // If user doesn't exist, create as STUDENT by default
    if (!user) {
      user = new User({
        name,
        email,
        role: "student",
        password: "", // no password for Google users
      });
      await user.save();
    }

    res.status(200).json({
      message: "Google login successful",
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(401).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
});

/* ================= GET ALL STUDENTS ================= */
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({
      role: { $regex: /^student$/i },
    }).select("name email");

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

module.exports = router;
