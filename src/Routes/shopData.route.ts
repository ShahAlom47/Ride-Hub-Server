import { Router } from 'express';
const router = Router();

import { editProduct, getAllShopProduct, getProductDetails, productOnline, updateProductStock } from '../Controller/shopData.controller';



router.get('/all-products', getAllShopProduct);
router.get('/productDetails/:id', getProductDetails);
router.patch('/updateStock', updateProductStock);
router.get('/onlineProduct', productOnline);
router.patch('/editProduct/:id', editProduct);

export default router;