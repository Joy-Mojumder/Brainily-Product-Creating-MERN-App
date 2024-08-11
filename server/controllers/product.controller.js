import Product from "../models/product.model.js";
import { v2 as cloudinary } from "cloudinary";
export const createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body; // user will send this data

    let { image } = req.body;

    if (!name || !description || !price || !image) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide all fields" });
    }

    const existProduct = await Product.findOne({
      name,
    });

    if (existProduct) {
      return res
        .status(400)
        .json({ success: false, error: "Product Already Exist" });
    }

    //* if img is present, upload img to cloudinary
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    // create new product
    const newProduct = new Product({ name, description, price, image });

    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.error("Error in Create product:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(401)
        .json({ success: false, error: "Please provide product id" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product Not Found" });
    }
    // * delete old image from cloudinary
    if (product.image) {
      // todo get old image id to delete from cloudinary
      await cloudinary.uploader.destroy(
        product.image.split("/").pop().split(".")[0]
      );
    }
    res
      .status(200)
      .json({ success: true, message: "Product Deleted Successfully" });
  } catch (err) {
    console.error("Error in Delete Product:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body; // user will send this data

    let { image } = req.body;

    const existProduct = await Product.findById(id);

    //^ update profileImg
    let img = existProduct.image;

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

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, image },
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error in Update Product:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
