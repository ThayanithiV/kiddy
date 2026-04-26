import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts'
import { toast } from 'react-toastify'
import axios from 'axios'

const Product = () => {
  const { productId } = useParams()
  const { products, currency, addToCart, requireAuth, navigate, backendUrl, token, updateProductInState, getEffectivePrice } = useContext(ShopContext)

  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [activeTab, setActiveTab] = useState('description')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const fetchProductData = () => {
    const foundProduct = products.find((item) => item._id === productId)

    if (foundProduct) {
      setProductData(foundProduct)
      setImage(foundProduct.image[0])
      setActiveTab('description')
    }
  }

  const fetchSingleProduct = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/product/single', { productId })
      if (response.data.success) {
        const freshProduct = response.data.product
        setProductData(freshProduct)
        setImage((currentImage) => currentImage || freshProduct.image[0])
        updateProductInState(freshProduct)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [productId, products])

  useEffect(() => {
    if (productId) {
      fetchSingleProduct()
    }
  }, [productId])

  const handleBuyNow = async () => {
    if (!requireAuth('Please login before buying a product')) {
      return
    }

    if (!size) {
      toast.error('Select Product Size')
      return
    }

    await addToCart(productData._id, size)
    navigate('/cart')
  }

  const renderStars = (rating = 0) => {
    const totalStars = 5
    const roundedRating = Math.round(rating)

    return [...Array(totalStars)].map((_, index) => (
      <img
        key={index}
        src={index < roundedRating ? assets.star_icon : assets.star_dull_icon}
        alt="star"
        className="w-4"
      />
    ))
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()

    if (!requireAuth('Please login before submitting a review')) {
      return
    }

    if (!reviewComment.trim()) {
      toast.error('Please enter your review')
      return
    }

    setIsSubmittingReview(true)

    try {
      const response = await axios.post(
        backendUrl + '/api/product/review',
        {
          productId,
          rating: reviewRating,
          comment: reviewComment
        },
        { headers: { token } }
      )

      if (response.data.success) {
        const updatedProduct = response.data.product
        setProductData(updatedProduct)
        updateProductInState(updatedProduct)
        setReviewComment('')
        setReviewRating(5)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const detailedDescriptionToShow =
    productData?.detailedDescription?.trim() ||
    productData?.shortDescription?.trim() ||
    productData?.description ||
    ''

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt={productData.name}
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt={productData.name} />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>

          <div className="flex items-center gap-1 mt-2">
            {renderStars(productData.rating)}
            <p className="pl-2">
              {productData.rating ? productData.rating.toFixed(1) : '0.0'} ({productData.reviews} reviews)
            </p>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <p className="text-3xl font-medium">
              {currency}
              {getEffectivePrice(productData)}
            </p>
            {productData.offerPrice && productData.offerPrice < productData.price ? (
              <p className="text-lg text-gray-400 line-through blur-[0.4px]">
                {currency}
                {productData.price}
              </p>
            ) : null}
          </div>

          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.shortDescription || productData.description}
          </p>

          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? 'border-orange-500' : ''
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => addToCart(productData._id, size)}
              className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
            >
              ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              className="border border-black px-8 py-3 text-sm"
            >
              BUY NOW
            </button>
          </div>

          <hr className="mt-8 sm:w-4/5" />

          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'font-semibold bg-white' : 'text-gray-500 bg-gray-50'}`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'font-semibold bg-white' : 'text-gray-500 bg-gray-50'}`}
          >
            Reviews ({productData.reviews})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>{detailedDescriptionToShow}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="border border-t-0 px-6 py-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
              <p className="text-sm text-gray-500 mt-1">
                Average rating: {productData.rating ? productData.rating.toFixed(1) : '0.0'} / 5
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 border-b pb-6 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <img
                        src={star <= reviewRating ? assets.star_icon : assets.star_dull_icon}
                        alt={`Rate ${star}`}
                        className="w-6"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none"
                rows="4"
                placeholder={token ? 'Write your review here' : 'Login to write a review'}
                disabled={!token || isSubmittingReview}
              />

              <div className="flex justify-between items-center gap-3">
                <p className="text-sm text-gray-500">
                  {token ? 'Your review will appear immediately after submit.' : 'Please login to add a review.'}
                </p>
                <button
                  type="submit"
                  disabled={!token || isSubmittingReview}
                  className="bg-black text-white px-6 py-2 text-sm disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-4">
              {productData.reviewsData?.length ? (
                productData.reviewsData.map((review) => (
                  <div key={review._id || `${review.userId}-${review.createdAt}`} className="border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900">{review.userName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  )
}

export default Product
