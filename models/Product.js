import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: "string",
      unique: true,
    },
    title: {
      type: "string",
    },
    thumbnails: {
      type: "array",
      default: [],
    },
    category: {
      type: "string",
      required: true,
    },
    brand_name: {
      type: "array",
      required: true,
    },
    quantityInWarehouse: {
      type: "number",
      default: 1000,
    },
    quantitySold: {
      type: "number",
      default: 0,
    },
    rootPrice: {
      type: "number",
      default: 0,
    },
    discountRate: {
      type: "number",
      default: 0,
    },
    discount: {
      // = rootPrice - salePrice
      type: "number",
      default: 0,
    },
    salePrice: {
      type: "number",
      default: 0,
    },
    inputDay: {
      type: "date",
      default: Date.now(),
    },
    information: {
      type: "object",
      default: { data: "No information available" },
    },
    description: {
      type: "object",
      default: { data: "No description available" },
    },
    shortDescription: {
      type: "object",
      default: { data: "No short description available" },
    },
    rating_average: {
      type: "number",
      default: 0,
    },
    review_count: {
      type: "number",
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
