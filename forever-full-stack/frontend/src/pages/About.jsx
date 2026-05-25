import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p>Kiddy Vogue is a trusted baby clothing brand established in 2020, dedicated to providing soft, safe, and stylish clothing for newborns and infants. We understand that a baby’s comfort is the top priority, which is why all our products are carefully designed using gentle, skin-friendly fabrics that keep your little ones cozy all day long.</p>
              <p>At Kiddy Vogue, we combine quality with affordability, ensuring that every parent can access premium baby wear without compromise. Our collection includes a variety of essentials such as jablas, rompers, swaddles, and everyday wear, all crafted with attention to detail and modern designs. Each piece is made to offer ease of use for parents while ensuring maximum comfort for babies.</p>
              <p>Since our beginning, we have been committed to maintaining high standards in both product quality and customer satisfaction. We continuously update our styles to match current trends while keeping the needs of newborns at the heart of everything we do.</p>
              <p>Kiddy Vogue is more than just a brand—it is a promise of care, comfort, and love for your baby’s first wardrobe.</p>
              <b className='text-gray-800'>Our Mission</b>
              <p>Kiddy Vogue’s mission is to provide comfortable, safe, and affordable clothing for newborns and infants. We focus on using soft, skin-friendly fabrics and thoughtful designs to ensure maximum care for babies. Our goal is to support parents with quality baby wear that combines style, durability, and everyday convenience.</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Quality Assurance:</b>
            <p className=' text-gray-600'>We ensure soft, safe, durable baby clothing through strict quality checks, premium fabrics, neat stitching, and baby-friendly designs.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Convenience:</b>
            <p className=' text-gray-600'>Our baby clothing is designed for easy wear, quick changes, and hassle-free care, making everyday parenting simple and comfortable.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Exceptional Customer Service:</b>
            <p className=' text-gray-600'>We are committed to quick support, clear communication, and a smooth shopping experience, ensuring every customer feels valued and satisfied.</p>
          </div>
      </div>

      {/* <NewsletterBox/> */}
      
    </div>
  )
}

export default About
