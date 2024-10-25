import { Router } from 'express';
const router = Router();

import  { addPaymentData, getStripeSecretKey, getUserOrderData } from '../Controller/paymentData.controller';


router.post('/stripe-secretKey',getStripeSecretKey)
router.post('/addPaymentData',addPaymentData)
router.get('/orderData/:email',getUserOrderData)

export default router; 