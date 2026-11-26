
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, campus, house } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof campus !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid registration details."
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCampus = campus.trim();

    if (!cleanName || !cleanEmail || !cleanCampus || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    if (
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanCampus.length > 100 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields are too long."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      campus: cleanCampus,
      house: typeof house === "string" ? house.trim().slice(0, 100) : "",
      role: "Student"
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        campus: user.campus,
        house: user.house,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed."
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid email and password."
      });
    }

    if (email.length > 254 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        campus: user.campus,
        house: user.house,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed."
    });
  }
};
