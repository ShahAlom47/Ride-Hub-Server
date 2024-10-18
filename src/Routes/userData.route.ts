import { Router } from 'express';
const router = Router();

import { addToCartProduct, addUser, createToken, getCartProduct, getUserData, removeCartProduct } from '../Controller/userData.controller';

router.post('/jwt', createToken);
router.post('/addUser', addUser);
router.get('/getUserData/:email', getUserData);
router.post('/addToCartProduct/:email', addToCartProduct);
router.get('/userCartData/:email', getCartProduct);
router.delete('/removeCartProduct', removeCartProduct);

export default router;