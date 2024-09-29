import { Router } from 'express';
const router = Router();

import { getAllShopProduct } from '../Controller/shopData.controller';



router.get('/all-products', getAllShopProduct);

export default router;