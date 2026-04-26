import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price,offerPrice,effectivePrice}) => {
    
    const {currency} = useContext(ShopContext);
    const finalPrice = effectivePrice ?? ((offerPrice && offerPrice < price) ? offerPrice : price)

  return (
    <Link onClick={()=>scrollTo(0,0)} className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className=' overflow-hidden'>
        <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt="" />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <div className='flex items-center gap-2 text-sm'>
        <p className='font-medium'>{currency}{finalPrice}</p>
        {offerPrice && offerPrice < price ? (
          <p className='text-gray-400 line-through blur-[0.3px]'>{currency}{price}</p>
        ) : null}
      </div>
    </Link>
  )
}

export default ProductItem
