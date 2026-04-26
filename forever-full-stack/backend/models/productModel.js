import mongoose from "mongoose";
import { CATEGORY_OPTIONS } from "../utils/category.js";

const reviewSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Number, default: Date.now }
}, { _id: true })

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, default: null },
    image: { type: Array, required: true },
    category: { type: String, required: true, enum: CATEGORY_OPTIONS },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    reviewsData: { type: [reviewSchema], default: [] }
})

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel
