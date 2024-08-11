import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoBD Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Failed To connect:${error.message}`);
    process.exit(1);
  }
};
