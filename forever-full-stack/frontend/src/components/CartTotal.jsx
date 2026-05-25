import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ shippingFee }) => {

    const {currency,delivery_fee,getCartAmount} = useContext(ShopContext);
    const appliedShippingFee = shippingFee ?? delivery_fee;
    const subtotal = getCartAmount();

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency} {subtotal}.00</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <p>Shipping Fee</p>
                <p>{currency} {appliedShippingFee}.00</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <b>Total</b>
                <b>{currency} {subtotal === 0 ? 0 : subtotal + appliedShippingFee}.00</b>
            </div>
      </div>
    </div>
  )
}

export default CartTotal
