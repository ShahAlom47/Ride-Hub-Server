import { Router } from 'express';
const router = Router();


import verifyToken from '../Middleware/verifyToken';
import  { addPaymentData, cancelOrder, getAllOrder, getStripeSecretKey, getUserOrderData, updateOrderStatus } from '../Controller/paymentData.controller';



router.post('/stripe-secretKey',getStripeSecretKey)
router.post('/addPaymentData',addPaymentData)
router.get('/orderData/:email', verifyToken , getUserOrderData)
router.patch('/cancelOrder/:id',verifyToken , cancelOrder)
router.get('/orders',verifyToken , getAllOrder)
router.patch('/updateOrder/:id',verifyToken , updateOrderStatus)

export default router; 