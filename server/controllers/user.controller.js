import User from "../models/auth.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.model.js";

export const updateUser = async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;

  let { image } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // * check if new password & current password is empty or not

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: "Password is required",
      });
    }

    // * check if new password & current password both provided or not
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        success: false,
        error: "Please provide both current password and new password",
      });
    }
    //~==== if new password & current password both provided
    if (newPassword && currentPassword) {
      // * storing isPasswordMatch in variable to check if current password matches with database password
      const isPasswordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      // * check if current password matches with database password
      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ success: false, error: "Current password is incorrect" });
      }

      // * check if new password is less than 6 characters long
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 6 characters long",
        });
      }

      // * salt & hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // * update password in database
      user.password = hashedPassword;
    }

    //^ update image in cludinary
    let img = user.image;

    let isImageMatch =
      img.split("/").pop().split(".")[0] ===
      image.split("/").pop().split(".")[0];

    if (!isImageMatch) {
      if (image) {
        // * delete old image from cloudinary
        if (img) {
          // todo get old image id to delete from cloudinary
          await cloudinary.uploader.destroy(img.split("/").pop().split(".")[0]);
        }
        // * upload image to cloudinary and store url in image variable
        const uploadResponse = await cloudinary.uploader.upload(image);

        image = uploadResponse.secure_url;
      }
    }

    // ^ update all fields in database
    user.username = username || user.username;
    user.email = email || user.email;
    user.image = image || user.image;

    // * update user in database
    user = await user.save();

    // * remove password from user
    user.password = null;
    // * send response with updated user
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const searchProduct = async (req, res) => {
  const { name, description, sort, price } = req.query;

  const queryObject = {};

  try {
    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }

    if (description) {
      queryObject.description = { $regex: description, $options: "i" };
    }

    if (price) {
      queryObject.price = { $regex: price, $options: "i" };
    }

    let products = Product.find(queryObject);

    if (sort) {
      let sortList = sort.replace(",", " ");
      products = products.sort(sortList);
    }

    const myProducts = await products;

    res.status(200).json({ success: true, data: myProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
