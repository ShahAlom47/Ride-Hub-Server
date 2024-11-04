import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getPaymentCollection } from '../Utils/AllDbCollection';
import { ObjectId } from 'mongodb';
import verifyToken from '../Middleware/verifyToken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const paymentCollection = getPaymentCollection()





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











export {
    getStripeSecretKey,
    addPaymentData,
    getUserOrderData,
    cancelOrder,
    getAllOrder,
    updateOrderStatus
};
