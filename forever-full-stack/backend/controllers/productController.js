import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import userModel from "../models/userModel.js"
import { isValidCategory, normalizeCategory } from "../utils/category.js"

const getEffectivePrice = (product) => {
    const hasOfferPrice = Number(product.offerPrice) > 0 && Number(product.offerPrice) < Number(product.price);
    return hasOfferPrice ? Number(product.offerPrice) : Number(product.price);
}

const formatProduct = (product) => {
    if (!product) {
        return null;
    }

    const productObject = product.toObject ? product.toObject() : product;
    const reviewsData = [...(productObject.reviewsData || [])].sort((a, b) => b.createdAt - a.createdAt);
    const totalRatings = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const rating = reviewsData.length ? totalRatings / reviewsData.length : 0;
    const shortDescription = (productObject.shortDescription || productObject.description || "").trim();
    const detailedDescription = (productObject.detailedDescription || "").trim() || shortDescription;
    const effectivePrice = getEffectivePrice(productObject);

    return {
        ...productObject,
        shortDescription,
        detailedDescription,
        offerPrice: productObject.offerPrice ?? null,
        effectivePrice,
        reviewsData,
        rating,
        reviews: reviewsData.length
    };
}

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, shortDescription, detailedDescription, price, offerPrice, category, subCategory, sizes, bestseller } = req.body
        const normalizedShortDescription = shortDescription?.trim() || "";
        const normalizedDetailedDescription = detailedDescription?.trim() || normalizedShortDescription;
        const normalizedCategory = normalizeCategory(category);

        if (!isValidCategory(normalizedCategory)) {
            return res.json({ success: false, message: "Invalid product category" })
        }

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            shortDescription: normalizedShortDescription,
            detailedDescription: normalizedDetailedDescription,
            category: normalizedCategory,
            price: Number(price),
            offerPrice: offerPrice ? Number(offerPrice) : null,
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products: products.map(formatProduct)})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        if (!product) {
            return res.json({ success: false, message: "Product not found" })
        }
        res.json({success:true,product: formatProduct(product)})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for updating product
const updateProduct = async (req, res) => {
    try {
        const { id, name, shortDescription, detailedDescription, price, offerPrice, category, subCategory, sizes, bestseller, existingImages } = req.body;
        const normalizedShortDescription = shortDescription?.trim() || "";
        const normalizedDetailedDescription = detailedDescription?.trim() || normalizedShortDescription;
        const normalizedCategory = normalizeCategory(category);

        if (!isValidCategory(normalizedCategory)) {
            return res.json({ success: false, message: "Invalid product category" });
        }

        const product = await productModel.findById(id);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const currentImages = existingImages ? JSON.parse(existingImages) : product.image;
        const uploadImageAtIndex = async (file, fallbackImage) => {
            if (!file) {
                return fallbackImage || null;
            }

            const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
            return result.secure_url;
        };

        const finalImages = (
            await Promise.all([
                uploadImageAtIndex(req.files?.image1?.[0], currentImages[0]),
                uploadImageAtIndex(req.files?.image2?.[0], currentImages[1]),
                uploadImageAtIndex(req.files?.image3?.[0], currentImages[2]),
                uploadImageAtIndex(req.files?.image4?.[0], currentImages[3]),
            ])
        ).filter(Boolean);

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            {
                name,
                shortDescription: normalizedShortDescription,
                detailedDescription: normalizedDetailedDescription,
                price: Number(price),
                offerPrice: offerPrice ? Number(offerPrice) : null,
                category: normalizedCategory,
                subCategory,
                bestseller: bestseller === "true" ? true : false,
                sizes: JSON.parse(sizes),
                image: finalImages,
            },
            { new: true }
        );

        res.json({ success: true, message: "Product Updated", product: formatProduct(updatedProduct) });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const addProductReview = async (req, res) => {
    try {
        const { productId, rating, comment, userId } = req.body;

        if (!productId) {
            return res.json({ success: false, message: "Product not found" });
        }

        const parsedRating = Number(rating);
        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        if (!comment?.trim()) {
            return res.json({ success: false, message: "Please enter your review" });
        }

        const [product, user] = await Promise.all([
            productModel.findById(productId),
            userModel.findById(userId)
        ]);

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const existingReviewIndex = product.reviewsData.findIndex((review) => review.userId === userId);
        const reviewPayload = {
            userId,
            userName: user.name,
            rating: parsedRating,
            comment: comment.trim(),
            createdAt: Date.now()
        };

        if (existingReviewIndex >= 0) {
            product.reviewsData[existingReviewIndex] = reviewPayload;
        } else {
            product.reviewsData.unshift(reviewPayload);
        }

        await product.save();

        res.json({
            success: true,
            message: existingReviewIndex >= 0 ? "Review updated successfully" : "Review added successfully",
            product: formatProduct(product)
        });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, updateProduct, removeProduct, singleProduct, addProductReview }
