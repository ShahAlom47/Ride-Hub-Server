import { Router } from 'express';
const router = Router();

import { addToCartProduct, addUser, changeUserRoll, clearCartProduct, createToken, deleteUser, getAllFirebaseUsers, getAllUser, getCartProduct, getUserData, removeCartProduct } from '../Controller/userData.controller';

router.post('/jwt', createToken);
router.post('/addUser', addUser);
router.get('/getUserData/:email', getUserData);
router.get('/getAllUser', getAllUser);
router.get('/getAllFireBaseUser', getAllFirebaseUsers);
router.post('/addToCartProduct/:email', addToCartProduct);
router.get('/userCartData/:email', getCartProduct);
router.delete('/removeCartProduct', removeCartProduct);
router.delete('/clearCartProduct/:email', clearCartProduct);
router.delete('/delete-user', deleteUser);
router.patch('/change-user-roll/:id', changeUserRoll);

export default router;