import { Router } from 'express';
const router = Router();

import  { addPaymentData, cancelOrder, getStripeSecretKey, getUserOrderData } from '../Controller/paymentData.controller';
import verifyToken from '../Middleware/verifyToken';


router.post('/stripe-secretKey',getStripeSecretKey)
router.post('/addPaymentData',addPaymentData)
router.get('/orderData/:email', verifyToken , getUserOrderData)
router.patch('/cancelOrder/:id',verifyToken , cancelOrder)

export default router; 