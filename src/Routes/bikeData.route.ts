import { Router } from 'express';
const router = Router();

import updateBikeView, { getBikeData, getBikeDetails, getLatestBikes, getWishListData } from '../Controller/bikeData.controller';



router.get('/all-bikeData', getBikeData);
router.get('/bike-details/:id', getBikeDetails);
router.patch('/updateBikeView/:id', updateBikeView);
router.get('/latest-bike', getLatestBikes);
router.post('/getWishListData/:category', getWishListData);

export default router;