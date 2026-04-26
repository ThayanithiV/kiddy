import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
            Kiddy Vogue is a baby clothing brand established in 2020, specializing in comfortable and stylish clothes for newborns. We focus on soft fabrics, safe designs, and affordable prices to ensure the best care for your little ones.
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <a href='/'><li>Home</li></a>
                <a href='/about'><li>About us</li></a>
                <a href='/orders'><li>Orders</li></a>
                <a href='/privacy-policy'><li>Privacy policy</li></a>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+91 99945 92400</li>
                <li>+91 99947 63267</li>
                <li>dineshkumarvelraj1106@gmail.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2020@ kiddyvogue - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
