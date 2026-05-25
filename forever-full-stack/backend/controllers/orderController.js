import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import nodemailer from 'nodemailer'

// global variables
const currency = 'inr'

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET,
})

const getShippingFee = (state = '') => {
    const normalizedState = state.toLowerCase().replace(/\s+/g, '');

    if (!normalizedState) {
        return 0;
    }

    if (normalizedState === 'tamilnadu') {
        return 50;
    }

    if (['kerala', 'karnataka', 'telangana', 'telungana', 'andhra', 'andhrapradesh'].includes(normalizedState)) {
        return 70;
    }

    return 180;
}

const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.");
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === "true",
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

const getTrackingLink = (orderId, origin) => {
    const frontendUrl = process.env.FRONTEND_URL || origin || '';
    return `${frontendUrl.replace(/\/$/, '')}/track-order/${orderId}`;
}

const sendOrderTrackingMail = async (order, origin) => {
    if (!order?.address?.email || order.confirmationEmailSent) {
        return;
    }

    const transporter = createTransporter();
    const sender = process.env.SMTP_MAIL || process.env.SMTP_USER;
    const trackingLink = getTrackingLink(order._id, origin);
    const productIds = order.items
        .map((item) => item._id || item.productId)
        .filter(Boolean)
        .join(', ');
    const itemsSummary = order.items
        .map((item) => `${item.name} (${item.size || 'N/A'}) x ${item.quantity}`)
        .join('<br />');
    const customerName = `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || 'Customer';

    await transporter.sendMail({
        from: sender,
        to: order.address.email,
        subject: `Order placed successfully - ${order._id}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${customerName},</h2>
                <p>Your order has been placed successfully. Your tracking details are below.</p>
                <p><strong>Order Tracking ID:</strong> ${order._id}</p>
                <p><strong>Product ID${productIds.includes(',') ? 's' : ''}:</strong> ${productIds || 'N/A'}</p>
                <p><strong>Tracking Link:</strong> <a href="${trackingLink}">${trackingLink}</a></p>
                <p><strong>Items:</strong><br />${itemsSummary}</p>
                <p>We will update the order status as it moves forward.</p>
            </div>
        `,
    });

    await orderModel.findByIdAndUpdate(order._id, { confirmationEmailSent: true });
}

const notifyOrderTracking = async (order, origin) => {
    try {
        await sendOrderTrackingMail(order, origin);
    } catch (error) {
        console.log('Order tracking email failed:', error.message);
    }
}

const getPeriodStartDate = (period) => {
    const now = new Date();
    const startDate = new Date(now);

    if (period === 'weekly') {
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        return startDate;
    }

    if (period === 'monthly') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        return startDate;
    }

    if (period === 'yearly') {
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        return startDate;
    }

    return null;
}

const csvEscape = (value) => {
    const stringValue = value === null || value === undefined ? '' : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
}

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address} = req.body;

        const orderData = {
            userId: userId || 'guest',
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        if (userId) {
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
        }

        await notifyOrderTracking(newOrder, req.headers.origin)

        res.json({
            success:true,
            message:"Order placed successfully. Tracking details have been sent to your email.",
            orderId: newOrder._id,
            trackingUrl: getTrackingLink(newOrder._id, req.headers.origin)
        })


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const { origin } = req.headers;

        const orderData = {
            userId: userId || 'guest',
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: getShippingFee(address?.state) * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            const order = await orderModel.findByIdAndUpdate(orderId, {payment:true}, { new: true });
            const orderUserId = userId || (order?.userId !== 'guest' ? order?.userId : null);
            if (orderUserId) {
                await userModel.findByIdAndUpdate(orderUserId, {cartData: {}})
            }
            await notifyOrderTracking(order, req.headers.origin)
            res.json({success: true, orderId, trackingUrl: getTrackingLink(orderId, req.headers.origin)});
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body

        const orderData = {
            userId: userId || 'guest',
            items,
            address,
            amount,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error,order)=>{
            if (error) {
                console.log(error)
                return res.json({success:false, message: error})
            }
            res.json({success:true,order})
        })

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id  } = req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            const order = await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true}, { new: true });
            const orderUserId = userId || (order?.userId !== 'guest' ? order?.userId : null);
            if (orderUserId) {
                await userModel.findByIdAndUpdate(orderUserId,{cartData:{}})
            }
            await notifyOrderTracking(order, req.headers.origin)
            res.json({
                success: true,
                message: "Payment Successful",
                orderId: orderInfo.receipt,
                trackingUrl: getTrackingLink(orderInfo.receipt, req.headers.origin)
            })
        } else {
             res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body
        const pendingPaymentStatuses = ['Order Placed', 'Packing']
        const updateData = pendingPaymentStatuses.includes(status)
            ? { status, payment: false }
            : { status }

        await orderModel.findByIdAndUpdate(orderId, updateData)
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const markPaymentDone = async (req,res) => {
    try {
        const { orderId } = req.body

        await orderModel.findByIdAndUpdate(orderId, { payment: true })
        res.json({success:true,message:'Payment marked as done'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

const downloadSalesInvoice = async (req, res) => {
    try {
        const { period } = req.params;
        const startDate = getPeriodStartDate(period);

        if (!startDate) {
            return res.status(400).json({ success: false, message: 'Invalid invoice period' });
        }

        const orders = await orderModel.find({
            date: { $gte: startDate.getTime() }
        }).sort({ date: -1 });

        const totalSales = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
        const totalItems = orders.reduce((sum, order) => (
            sum + order.items.reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0)
        ), 0);

        const headerRows = [
            ['Kiddy Vogue Sales Invoice'],
            [`Period`, period],
            ['Generated At', new Date().toLocaleString()],
            ['Orders Count', orders.length],
            ['Items Sold', totalItems],
            ['Total Sales', totalSales],
            [],
            ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Phone', 'Items', 'Quantity', 'Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Address']
        ];

        const orderRows = orders.map((order) => {
            const itemsSummary = order.items.map((item) => `${item.name} (${item.size || 'N/A'}) x ${item.quantity}`).join(' | ');
            const quantity = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const customerName = `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim();
            const customerAddress = [
                order.address.street,
                order.address.city,
                order.address.state,
                order.address.country,
                order.address.zipcode
            ].filter(Boolean).join(', ');

            return [
                order._id,
                new Date(order.date).toLocaleDateString(),
                customerName,
                order.address.email || '',
                order.address.phone || '',
                itemsSummary,
                quantity,
                order.amount,
                order.paymentMethod,
                order.payment ? 'Done' : 'Pending',
                order.status,
                customerAddress
            ];
        });

        const csvContent = [...headerRows, ...orderRows]
            .map((row) => row.map(csvEscape).join(','))
            .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${period}-sales-invoice.csv`);
        res.send(csvContent);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, markPaymentDone, trackOrder, downloadSalesInvoice}
