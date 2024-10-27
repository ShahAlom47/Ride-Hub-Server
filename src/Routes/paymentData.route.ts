import { Router } from 'express';
const router = Router();

import  { addPaymentData, cancelOrder, getStripeSecretKey, getUserOrderData } from '../Controller/paymentData.controller';


router.post('/stripe-secretKey',getStripeSecretKey)
router.post('/addPaymentData',addPaymentData)
router.get('/orderData/:email',getUserOrderData)
router.patch('/cancelOrder/:id',cancelOrder)

export default router; 