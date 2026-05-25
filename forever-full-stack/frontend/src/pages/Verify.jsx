import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import {toast} from 'react-toastify'
import axios from 'axios'

const Verify = () => {

    const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
    const [searchParams, setSearchParams] = useSearchParams()
    
    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async () => {
        try {

            const requestConfig = token ? { headers: { token } } : {}
            const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, requestConfig)

            if (response.data.success) {
                setCartItems({})
                navigate(`/track-order/${response.data.orderId || orderId}`)
            } else {
                navigate('/cart')
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [success, orderId, token])

    return (
        <div>

        </div>
    )
}

export default Verify
