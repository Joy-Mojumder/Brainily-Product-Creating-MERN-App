import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  let { image } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Please provide name, email and password",
    });
  }
  //^ email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 6 characters long",
    });
  }
  // validation
  const existUser = await User.findOne({ email });

  if (existUser)
    return res
      .status(400)
      .json({ success: false, error: "User already exists" });
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //* if img is present, upload img to cloudinary
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    //^ create new user
    const newUser = new User({
      username,
      email,
      image,
      password: hashedPassword,
    });

    // save user in database
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      //^ save user
      await newUser.save();
      res.status(201).json({
        success: true,
        data: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          image: newUser.image,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide email and password" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user?.password || "");
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Incorrect email or password",
      });
    }
    // ^ generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// logout
export const logout = async (req, res) => {
  try {
    //clear cookie
    res.cookie("jwt", "", {
      maxAge: 0,
    });

    // ^ send response
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// get user data
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    //send response
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
