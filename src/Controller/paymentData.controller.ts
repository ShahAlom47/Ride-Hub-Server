import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getPaymentCollection } from '../Utils/AllDbCollection';
import { ObjectId } from 'mongodb';

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
            res.send({ status:false, message: 'Invalid Product ID' });
            return;
        }

        const updateRes = await paymentCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: { status: 'Cancelled' } }
        );


        if (updateRes.modifiedCount === 0) {
            res.send({ status:false, message: 'Order not found or already cancelled.' });
            return;
        }

        res.send({status:true, message: 'Order cancelled successfully.' });

    } catch (error) {
        console.error('Error while cancelling order: ', error);
        res.send({ error: 'Failed to cancel order. Please try again later.' });
    }
};




export {
    getStripeSecretKey,
    addPaymentData,
    getUserOrderData,
    cancelOrder,
};
