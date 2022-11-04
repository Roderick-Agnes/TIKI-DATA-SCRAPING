import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: "string",
      required: true,
    },
    products: [
      {
        productId: {
          type: "string",
          required: true,
        },
        quantity: {
          type: "number",
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
