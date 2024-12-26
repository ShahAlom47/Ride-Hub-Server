import { Router } from 'express';
const router = Router();

import { addProduct, editProduct, getAllShopProduct, getProductDetails, productOnline, updateProductStock } from '../Controller/shopData.controller';



router.get('/all-products', getAllShopProduct);
router.get('/productDetails/:id', getProductDetails);
router.patch('/updateStock', updateProductStock);
router.get('/onlineProduct', productOnline);
router.patch('/editProduct/:id', editProduct);
router.post('/addProduct', addProduct);

export default router;