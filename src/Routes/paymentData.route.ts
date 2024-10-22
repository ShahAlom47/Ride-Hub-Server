import { Router } from 'express';
const router = Router();

import  { addPaymentData, getStripeSecretKey } from '../Controller/paymentData.controller';


router.post('/stripe-secretKey',getStripeSecretKey)
router.post('/addPaymentData',addPaymentData)

export default router; 