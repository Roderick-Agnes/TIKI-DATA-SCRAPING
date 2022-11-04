import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
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
    amount: {
      type: "number",
      required: true,
    },
    address: {
      type: "object",
      required: true,
    },
    orderStatus: {
      type: "string",
      default: "pending", // status includes: pending, canceled, success
    },
    paymentStatus: {
      type: "string",
      default: "none", // status includes: pending, none, success. With pending status: customer chooses payment method at their home
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
