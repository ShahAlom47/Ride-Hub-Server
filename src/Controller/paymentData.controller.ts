import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getPaymentCollection } from '../Utils/AllDbCollection';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const paymentCollection = getPaymentCollection()

const getStripeSecretKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount } = req.body;
        const amountValue: number = typeof amount === 'string' ? parseFloat(amount) : amount;

       
        const amountInt: number = Math.round(100 * amountValue); 

        const MAX_AMOUNT = 99999999; // in the smallest currency unit, for AED this is 999,999.99 AED
        console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

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
            res.send({ status: true, message: 'Payment completed successfully.' });
            return;
        } else {
            res.send({ status: false, message: 'Failed to process payment.' });
        }

    } catch (error) {
        console.error('Error adding payment data:', error);
        res.send({ status: false, message: 'An error occurred while adding payment data.' });
    }
};




export {
    getStripeSecretKey,
    addPaymentData,
};
