import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // SUCCESS RESPONSE
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Google
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    console.log("Received token:", token?.substring(0, 50));

    const decoded = await admin.auth().verifyIdToken(token);

    console.log("Decoded:", decoded);

    const { uid, email, name, picture } = decoded;

    let user = await User.findOne({
      email,
    });

    if (!user) {
      user = await User.create({
        username: name,
        email,
        googleId: uid,
        avatar: picture,
      });
    } else if (!user.googleId) {
      user.googleId = uid;

      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.log("Google auth error:", error);

    res.status(401).json({
      message: "Google auth failed",
    });
  }
};
// Protected
export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};
