import { Router } from 'express';
const router = Router();

import { checkCoupon, getCoupon } from '../Controller/couponData.controller';


router.get('/getCoupon',getCoupon)
router.post('/checkCoupon',checkCoupon)


export default router;