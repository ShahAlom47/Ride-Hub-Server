import { Router } from 'express';
const router = Router();

import updateBikeView, { addBike, deleteBike, editBikeData, editBikePhoto, getBikeData, getBikeDetails, getLatestBikes, getUserRentedBike, getWishListData, updateBikeRentStatus } from '../Controller/bikeData.controller';



router.get('/all-bikeData', getBikeData);
router.get('/bike-details/:id', getBikeDetails);
router.patch('/updateBikeView/:id', updateBikeView);
router.get('/latest-bike', getLatestBikes);
router.post('/getWishListData/:category', getWishListData);
router.patch('/updateRentStatus/:id', updateBikeRentStatus);
router.patch('/editBikeData/:id', editBikeData);
router.patch('/changeBikePhoto/:id', editBikePhoto);
router.post('/addBike',addBike );
router.delete('/deleteBike/:id',deleteBike );
router.get('/getMyRentedBike/:email',getUserRentedBike);

export default router;