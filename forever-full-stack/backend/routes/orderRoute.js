import express from 'express'
import {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, markPaymentDone, trackOrder, verifyStripe, verifyRazorpay, downloadSalesInvoice} from '../controllers/orderController.js'
import adminAuth  from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import { optionalAuthUser } from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list',adminAuth,allOrders)
orderRouter.post('/status',adminAuth,updateStatus)
orderRouter.post('/payment-done',adminAuth,markPaymentDone)
orderRouter.get('/invoice/:period',adminAuth,downloadSalesInvoice)

// Payment Features
orderRouter.post('/place-guest',placeOrder)
orderRouter.post('/place',placeOrder)
orderRouter.post('/stripe',optionalAuthUser,placeOrderStripe)
orderRouter.post('/razorpay',optionalAuthUser,placeOrderRazorpay)

// User Feature 
orderRouter.post('/userorders',authUser,userOrders)
orderRouter.get('/track/:orderId',trackOrder)

// verify payment
orderRouter.post('/verifyStripe',optionalAuthUser, verifyStripe)
orderRouter.post('/verifyRazorpay',optionalAuthUser, verifyRazorpay)

export default orderRouter
