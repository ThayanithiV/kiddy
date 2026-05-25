import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
      
      <div>
        <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
        <p className=' font-semibold'>Always Here for You 💕</p>
        <p className=' text-gray-400'>We provide 24/7 support for all your needs.</p>
      </div>
      <div>
        <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
        <p className=' font-semibold'>Safe & Hygienic Products 🧼</p>
        <p className=' text-gray-400'>Due to hygiene reasons, returns are not accepted.</p>
      </div>
      <div>
        <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
        <p className=' font-semibold'>Fresh for Every Baby 👶</p>
        <p className=' text-gray-400'>We don’t offer replacements to maintain product safety.</p>
      </div>

    </div>
  )
}

export default OurPolicy
