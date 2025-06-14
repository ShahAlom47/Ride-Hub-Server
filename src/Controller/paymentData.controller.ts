import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getPaymentCollection } from '../Utils/AllDbCollection';
import { ObjectId } from 'mongodb';
import verifyToken from '../Middleware/verifyToken';
const SSLCommerzPayment = require('sslcommerz-lts');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const paymentCollection = getPaymentCollection()

// SSLCommerz  
const store_id = process.env.SSL_COMMERZ_STORE_ID || 'YOUR_STORE_ID';
const store_passwd = process.env.SSL_COMMERZ_STORE_PASSWORD || 'YOUR_STORE_PASSWORD';
// const is_live = process.env.SSL_COMMERZ_IS_LIVE; // sandbox
const is_live = false; // sandbox

const sslInit = async (req: Request, res: Response): Promise<void>  => {
    const {email,amount}= req.body;
    const data = {
        total_amount: 120,
        currency: 'BDT',
        tran_id: 'TXN_' + Date.now(),
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((response: any) => {
        console.log( 'response'  ,response ,);
        res.redirect(response.GatewayPageURL);
    }).catch((err: any) => {
        res.status(500).send('Payment initiation failed.');
    });
};

const getStripeSecretKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount } = req.body;
        const amountValue: number = typeof amount === 'string' ? parseFloat(amount) : amount;


        const amountInt: number = Math.round(100 * amountValue);

        const MAX_AMOUNT = 99999999; // in the smallest currency unit, for AED this is 999,999.99 AED


        // Check if the amount exceeds the maximum allowed
        if (amountInt > MAX_AMOUNT) {
            res.send({ error: 'Amount must be no more than 999,999 AED' });
            return;
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInt,
            currency: "aed",
            payment_method_types: ["card"],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.send({ error: 'Failed to create payment intent' });
    }
};

const addPaymentData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { paymentData } = req.body;

        // Check if paymentData is provided
        if (!paymentData) {
            res.send({ status: false, message: 'Payment data is missing.' });
            return;
        }

        const addingRes = await paymentCollection.insertOne(paymentData);

        if (addingRes.insertedId) {
            res.send({ status: true, message: 'Payment completed successfully.', orderId: addingRes?.insertedId });
            return;
        } else {
            res.send({ status: false, message: 'Failed to process payment.' });
        }

    } catch (error) {
        console.error('Error adding payment data:', error);
        res.send({ status: false, message: 'An error occurred while adding payment data.' });
    }
};

const getUserOrderData = async (req: Request, res: Response): Promise<void> => {
    try {

        const userEmail = req.params.email;
        const result = await paymentCollection.find({ userEmail: userEmail, status: { $ne: 'Cancelled' } }).toArray();
        res.send(result)
        return

    } catch (error) {
        console.error('Error getting order data : ', error);
        res.send({ error: 'Failed to create payment intent' });
    }

}


const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = req.params.id;

        if (!ObjectId.isValid(productId)) {
            res.send({ status: false, message: 'Invalid Product ID' });
            return;
        }

        const updateRes = await paymentCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { status: 'Cancelled' } }
        );


        if (updateRes.modifiedCount === 0) {
            res.send({ status: false, message: 'Order not found or already cancelled.' });
            return;
        }

        res.send({ status: true, message: 'Order cancelled successfully.' });

    } catch (error) {
        console.error('Error while cancelling order: ', error);
        res.send({ error: 'Failed to cancel order. Please try again later.' });
    }
};



const getAllOrder = async (req: Request, res: Response): Promise<void> => {
    const itemPerPage = parseInt(req.query.item as string) || 10;
    const searchValue = req.query.search || '';
    const filterDateString = req.query.filterDate as string; // Get as string
    const filterDate = filterDateString ? new Date(filterDateString) : null;
    const currentPage = parseInt(req.query.currentPage as string) || 1;

    console.log(filterDate);

    try {
        const query: any = {};

        // Search query
        if (searchValue) {
            query.$or = [
                { name: { $regex: searchValue, $options: 'i' } },
                { email: { $regex: searchValue, $options: 'i' } }
            ];
        }

        // Month and Year filtering
        if (filterDate) {
            const month = filterDate.getMonth() + 1; // Local time zone month
            const year = filterDate.getFullYear(); // Local time zone year

            query.$expr = {
                $and: [
                    { $eq: [{ $month: { $toDate: "$orderDate" } }, month] },
                    { $eq: [{ $year: { $toDate: "$orderDate" } }, year] }
                ]
            };
        }

        const skipItems = (currentPage - 1) * itemPerPage;

        const orders = await paymentCollection.find(query)
            .skip(skipItems)
            .limit(itemPerPage)
            .sort({ orderDate: -1 })
            .toArray();

        // Order summary aggregation
        const orderSummary = await paymentCollection.aggregate([
            {
                $match: { status: { $ne: "Cancelled" } }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$finalAmount" },
                    totalTransactions: { $sum: 1 },
                    totalCustomers: { $addToSet: "$userEmail" },
                    totalProductsSold: { $sum: "$totalProduct" }
                }
            },
            {
                $project: {
                    totalRevenue: 1,
                    totalTransactions: 1,
                    totalCustomers: { $size: "$totalCustomers" },
                    totalProductsSold: 1
                }
            }
        ]).toArray();

        const totalOrders = await paymentCollection.countDocuments(query);

        // Sending response with orders, pagination info, and summary
        res.send({
            orders,
            totalPages: Math.ceil(totalOrders / itemPerPage),
            currentPage,
            orderSummary: orderSummary[0] || {} // Return the first item of the aggregation result or empty object if none
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send({ message: 'Server error occurred' });
    }
};


const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const updateRes = await paymentCollection.updateOne({ _id: new ObjectId(id) }, {
            $set: { status: status }
        })
        if (updateRes.modifiedCount > 0) {
            res.send({ status: true, message: 'Order Status Updated Successfully' });
            return
        }
        res.send({ status: false, message: 'Order Status Update Failed' });

    } catch (error) {

        res.send({ status: false, message: 'Order Status Update Failed' });


    }

}






const getSummery = async (req: Request, res: Response): Promise<void> => {
    try {
        // ৬ মাস আগের তারিখ বের করা
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);


        const [summaryData] = await paymentCollection.aggregate([
            {
                $addFields: {
                    createdAt: {
                        $toDate: "$createdAt", // `createdAt` কে Date টাইপে রূপান্তর
                    },
                },
            },
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        type: "$type",
                    },
                    totalAmount: { $sum: "$finalAmount" },
                },
            },
            {
                $group: {
                    _id: "$_id.month",
                    Shop: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "product_purchase"] }, "$totalAmount", 0],
                        },
                    },
                    Bike: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", "rent_bike"] }, "$totalAmount", 0],
                        },
                    },
                    totalMonthAmount: { $sum: "$totalAmount" },
                },
            },
            {
                $addFields: {
                    monthName: {
                        $arrayElemAt: [
                            [
                                "", // Placeholder for index 0
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                            ],
                            "$_id",
                        ],
                    },
                },
            },
            {
                $sort: { _id: 1 }, 
            },
            {
                $group: {
                    _id: null,
                    monthlyData: {
                        $push: {
                            month: "$monthName",
                            Shop: "$Shop",
                            Bike: "$Bike",
                            totalMonthAmount: "$totalMonthAmount",
                        },
                    },
                    totalShopAmount: { $sum: "$Shop" },
                    totalBikeAmount: { $sum: "$Bike" },
                    totalAmount: { $sum: "$totalMonthAmount" },
                },
            },
            {
                $project: {
                    _id: 0, 
                    monthlyData: 1,
                    totalShopAmount: 1,
                    totalBikeAmount: 1,
                    totalAmount: 1,
                },
            },
        ]).toArray();

     
        res.status(200).json(summaryData);
    } catch (error) {
        console.error("Error generating summary data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



export default getSummery;











export {
    getStripeSecretKey,
    addPaymentData,
    getUserOrderData,
    cancelOrder,
    getAllOrder,
    updateOrderStatus,
    getSummery,
    sslInit
};
