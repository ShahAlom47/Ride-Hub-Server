import { Router } from 'express';
const router = Router();

import { getAllShopProduct, getProductDetails } from '../Controller/shopData.controller';



router.get('/all-products', getAllShopProduct);
router.get('/productDetails/:id', getProductDetails);

export default router;