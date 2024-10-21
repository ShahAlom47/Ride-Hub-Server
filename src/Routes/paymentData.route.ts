import { Router } from 'express';
const router = Router();

import { getStripeSecretKey } from '../Controller/paymentData.controller';


router.post('/stripe-secretKey',getStripeSecretKey)


export default router; 