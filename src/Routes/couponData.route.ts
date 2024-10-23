import { Router } from 'express';
const router = Router();

import { addCouponUser, checkCoupon, getCoupon } from '../Controller/couponData.controller';


router.get('/getCoupon',getCoupon)
router.post('/checkCoupon',checkCoupon)
router.patch('/addCouponUser/:category',addCouponUser)


export default router;