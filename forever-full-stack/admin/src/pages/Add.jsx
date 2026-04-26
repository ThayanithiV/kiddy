import React, { useEffect, useState } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { normalizeCategory } from '../utils/category'

const Add = ({token, isEdit = false}) => {
  const navigate = useNavigate()
  const { productId } = useParams()

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)

   const [name, setName] = useState("");
   const [shortDescription, setShortDescription] = useState("");
   const [detailedDescription, setDetailedDescription] = useState("");
   const [price, setPrice] = useState("");
   const [offerPrice, setOfferPrice] = useState("");
   const [category, setCategory] = useState("Boys");
   const [subCategory, setSubCategory] = useState("Topwear");
   const [bestseller, setBestseller] = useState(false);
   const [sizes, setSizes] = useState([]);
   const [loadingProduct, setLoadingProduct] = useState(false);

   const getImagePreview = (image) => {
    if (!image) {
      return assets.upload_area
    }

    if (typeof image === 'string') {
      return image
    }

    return URL.createObjectURL(image)
   }

   const resetForm = () => {
      setName('')
      setShortDescription('')
      setDetailedDescription('')
      setPrice('')
      setOfferPrice('')
      setCategory('Boys')
      setSubCategory('Topwear')
      setBestseller(false)
      setSizes([])
      setImage1(false)
      setImage2(false)
      setImage3(false)
      setImage4(false)
   }

   const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      
      const formData = new FormData()

      formData.append("name",name)
      formData.append("shortDescription",shortDescription)
      formData.append("detailedDescription",detailedDescription)
      formData.append("price",price)
      formData.append("offerPrice",offerPrice)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes))
      formData.append("existingImages", JSON.stringify([
        typeof image1 === 'string' ? image1 : null,
        typeof image2 === 'string' ? image2 : null,
        typeof image3 === 'string' ? image3 : null,
        typeof image4 === 'string' ? image4 : null,
      ]))

      image1 && typeof image1 !== 'string' && formData.append("image1",image1)
      image2 && typeof image2 !== 'string' && formData.append("image2",image2)
      image3 && typeof image3 !== 'string' && formData.append("image3",image3)
      image4 && typeof image4 !== 'string' && formData.append("image4",image4)

      if (isEdit) {
        formData.append("id", productId)
      }

      const response = await axios.post(backendUrl + (isEdit ? "/api/product/update" : "/api/product/add"),formData,{headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        if (isEdit) {
          navigate('/list')
        } else {
          resetForm()
        }
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message)
    }
   }

   useEffect(() => {
    const fetchProduct = async () => {
      if (!isEdit || !productId) {
        return
      }

      setLoadingProduct(true)
      try {
        const response = await axios.post(backendUrl + '/api/product/single', { productId })
        if (response.data.success) {
          const product = response.data.product
          setName(product.name || '')
          setShortDescription(product.shortDescription || '')
          setDetailedDescription(product.detailedDescription || '')
          setPrice(product.price || '')
          setOfferPrice(product.offerPrice || '')
          setCategory(normalizeCategory(product.category) || 'Boys')
          setSubCategory(product.subCategory || 'Topwear')
          setBestseller(Boolean(product.bestseller))
          setSizes(product.sizes || [])
          setImage1(product.image?.[0] || false)
          setImage2(product.image?.[1] || false)
          setImage3(product.image?.[2] || false)
          setImage4(product.image?.[3] || false)
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.message || error.message)
      } finally {
        setLoadingProduct(false)
      }
    }

    fetchProduct()
   }, [backendUrl, isEdit, productId])

  return (
    loadingProduct ? <p>Loading product...</p> :
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Upload Image</p>

          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20 h-20 object-cover' src={getImagePreview(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20 h-20 object-cover' src={getImagePreview(image2)} alt="" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20 h-20 object-cover' src={getImagePreview(image3)} alt="" />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20 h-20 object-cover' src={getImagePreview(image4)} alt="" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
            </label>
          </div>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product name</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Short description</p>
          <textarea onChange={(e)=>setShortDescription(e.target.value)} value={shortDescription} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write short description here' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Detailed description</p>
          <textarea onChange={(e)=>setDetailedDescription(e.target.value)} value={detailedDescription} className='w-full max-w-[500px] px-3 py-2 min-h-[140px]' type="text" placeholder='Write detailed description here (optional)'/>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

            <div>
              <p className='mb-2'>Product category</p>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <p className='mb-2'>Sub category</p>
              <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
                  <option value="Topwear">Topwear</option>
                  <option value="Bottomwear">Bottomwear</option>
                  <option value="Winterwear">Winterwear</option>
              </select>
            </div>

            <div>
              <p className='mb-2'>Product Price</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
            </div>

            <div>
              <p className='mb-2'>Offer Price</p>
              <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} className='w-full px-3 py-2 sm:w-[120px]' type="Number" min="0" placeholder='Optional' />
            </div>

        </div>

        <div>
          <p className='mb-2'>Product Sizes</p>
          <div className='flex gap-3'>
            <div onClick={()=>setSizes(prev => prev.includes("01 to 3 months") ? prev.filter( item => item !== "01 to 3 months") : [...prev,"01 to 3 months"])}>
              <p className={`${sizes.includes("01 to 3 months") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>01 to 3 months</p>
            </div>
            
            <div onClick={()=>setSizes(prev => prev.includes("3 to 6 months") ? prev.filter( item => item !== "3 to 6 months") : [...prev,"3 to 6 months"])}>
              <p className={`${sizes.includes("3 to 6 months") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>3 to 6 months</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("6 to 12 months") ? prev.filter( item => item !== "6 to 12 months") : [...prev,"6 to 12 months"])}>
              <p className={`${sizes.includes("6 to 12 months") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>6 to 12 months</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("12 to 24 months") ? prev.filter( item => item !== "12 to 24 months") : [...prev,"12 to 24 months"])}>
              <p className={`${sizes.includes("12 to 24 months") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>12 to 24 months</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("2 to 6 years") ? prev.filter( item => item !== "2 to 6 years") : [...prev,"2 to 6 years"])}>
              <p className={`${sizes.includes("2 to 6 years") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>2 to 6 years</p>
            </div>

            {/* <div onClick={()=>setSizes(prev => prev.includes("XXL") ? prev.filter( item => item !== "XXL") : [...prev,"XXL"])}>
              <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XXL</p>
            </div> */}
          </div>
        </div>

        <div className='flex gap-2 mt-2'>
          <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
          <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
        </div>

        <button type="submit" className='w-28 py-3 mt-4 bg-black text-white'>{isEdit ? 'UPDATE' : 'ADD'}</button>

    </form>
  )
}

export default Add
