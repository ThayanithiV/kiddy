import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])
  const [downloadingPeriod, setDownloadingPeriod] = useState('')

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }

    try {

      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }


  }

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: {token}})
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(response.data.message)
    }
  }

  const paymentDoneHandler = async (orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/payment-done', { orderId }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const downloadInvoice = async (period) => {
    try {
      setDownloadingPeriod(period)

      const response = await axios.get(backendUrl + `/api/order/invoice/${period}`, {
        headers: { token },
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${period}-sales-invoice.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${period[0].toUpperCase() + period.slice(1)} invoice downloaded`)
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setDownloadingPeriod('')
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  return (
    <div>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
        <h3 className='text-lg font-medium'>Order Page</h3>
        <div className='flex flex-wrap gap-3'>
          <button onClick={() => downloadInvoice('weekly')} className='border px-4 py-2 bg-white text-sm'>
            {downloadingPeriod === 'weekly' ? 'Downloading...' : 'Weekly Invoice'}
          </button>
          <button onClick={() => downloadInvoice('monthly')} className='border px-4 py-2 bg-white text-sm'>
            {downloadingPeriod === 'monthly' ? 'Downloading...' : 'Monthly Invoice'}
          </button>
          <button onClick={() => downloadInvoice('yearly')} className='border px-4 py-2 bg-white text-sm'>
            {downloadingPeriod === 'yearly' ? 'Downloading...' : 'Yearly Invoice'}
          </button>
        </div>
      </div>
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> </p>
                    }
                    else {
                      return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> ,</p>
                    }
                  })}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : { order.payment ? 'Done' : 'Pending' }</p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>
              <div className='flex flex-col gap-2'>
                <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  onClick={() => paymentDoneHandler(order._id)}
                  disabled={order.payment}
                  className='border px-4 py-2 bg-black text-white text-sm disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {order.payment ? 'Payment Done' : 'Mark Payment Done'}
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders
