import { Router } from 'express';
const router = Router();


import verifyToken from '../Middleware/verifyToken';
import  getSummery, { addPaymentData, cancelOrder, getAllOrder, getStripeSecretKey, getUserOrderData, sslInit, updateOrderStatus } from '../Controller/paymentData.controller';



router.post('/ssl-init',sslInit)
router.post('/stripe-secretKey',getStripeSecretKey)
router.post('/addPaymentData',addPaymentData)
router.get('/orderData/:email', verifyToken , getUserOrderData)
router.patch('/cancelOrder/:id',verifyToken , cancelOrder)
router.get('/orders',verifyToken , getAllOrder)
router.get('/getSummery',verifyToken , getSummery)
router.patch('/updateOrder/:id',verifyToken , updateOrderStatus)

export default router; 