import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: "string",
      required: true,
      minlength: 8,
      maxlength: 20,
      unique: true,
    },
    email: {
      type: "string",
      required: true,
      minlength: 10,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: "string",
      required: true,
      minlength: 8,
      maxlength: 255,
    },
    isAdmin: {
      type: "boolean",
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
