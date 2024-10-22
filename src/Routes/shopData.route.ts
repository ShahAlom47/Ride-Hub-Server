import { Router } from 'express';
const router = Router();

import { getAllShopProduct, getProductDetails, updateProductStock } from '../Controller/shopData.controller';



router.get('/all-products', getAllShopProduct);
router.get('/productDetails/:id', getProductDetails);
router.patch('/updateStock', updateProductStock);

export default router;