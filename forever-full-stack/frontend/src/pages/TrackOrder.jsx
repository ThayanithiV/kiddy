import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'

const TrackOrder = () => {
  const { orderId } = useParams()
  const { backendUrl, currency, navigate } = useContext(ShopContext)
  const [trackingId, setTrackingId] = useState(orderId || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(Boolean(orderId))
  const [error, setError] = useState('')

  const loadOrder = async (idToTrack) => {
    const cleanTrackingId = idToTrack.trim()

    if (!cleanTrackingId) {
      setError('Please enter your tracking ID')
      setOrder(null)
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const response = await axios.get(`${backendUrl}/api/order/track/${cleanTrackingId}`)

      if (response.data.success) {
        setOrder(response.data.order)
        navigate(`/track-order/${cleanTrackingId}`)
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    loadOrder(trackingId)
  }

  useEffect(() => {
    if (orderId) {
      setTrackingId(orderId)
      loadOrder(orderId)
    }
  }, [backendUrl, orderId])

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl mb-6'>
        <Title text1={'TRACK'} text2={'ORDER'} />
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3 max-w-2xl'>
        <input
          value={trackingId}
          onChange={(event) => setTrackingId(event.target.value)}
          className='border border-gray-300 px-4 py-3 flex-1'
          type='text'
          placeholder='Enter order tracking ID'
        />
        <button type='submit' className='bg-black text-white px-8 py-3 text-sm'>
          TRACK ORDER
        </button>
      </form>

      {loading ? <p className='mt-6 text-gray-500'>Loading order...</p> : null}
      {error ? <p className='mt-6 text-red-500'>{error}</p> : null}

      {order ? (
        <>
          <div className='border p-5 text-sm text-gray-700 flex flex-col gap-2 mt-8'>
            <p><span className='font-medium text-gray-900'>Tracking ID:</span> {order._id}</p>
            <p><span className='font-medium text-gray-900'>Status:</span> {order.status}</p>
            <p><span className='font-medium text-gray-900'>Payment:</span> {order.payment ? 'Done' : 'Pending'} ({order.paymentMethod})</p>
            <p><span className='font-medium text-gray-900'>Date:</span> {new Date(order.date).toDateString()}</p>
            <p><span className='font-medium text-gray-900'>Total:</span> {currency}{order.amount}</p>
          </div>

          <div className='mt-8 flex flex-col gap-4'>
            {order.items.map((item, index) => (
              <div key={item._id || index} className='border p-4 flex gap-4 text-sm text-gray-700'>
                {item.image?.[0] ? <img className='w-16 h-16 object-cover' src={item.image[0]} alt={item.name} /> : null}
                <div className='flex flex-col gap-1'>
                  <p className='font-medium text-gray-900'>{item.name}</p>
                  <p>Product ID: {item._id || 'N/A'}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                  <p>Price: {currency}{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className='mt-8 border p-5 text-sm text-gray-500'>
          Enter the tracking ID from your order email to view the current status.
        </div>
      )}
    </div>
  )
}

export default TrackOrder
