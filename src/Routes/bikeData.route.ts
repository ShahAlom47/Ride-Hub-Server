import { Router } from 'express';
const router = Router();

import updateBikeView, { editBikeData, getBikeData, getBikeDetails, getLatestBikes, getWishListData, updateBikeRentStatus } from '../Controller/bikeData.controller';



router.get('/all-bikeData', getBikeData);
router.get('/bike-details/:id', getBikeDetails);
router.patch('/updateBikeView/:id', updateBikeView);
router.get('/latest-bike', getLatestBikes);
router.post('/getWishListData/:category', getWishListData);
router.patch('/updateRentStatus/:id', updateBikeRentStatus);
router.patch('/editBikeData/:id', editBikeData);

export default router;