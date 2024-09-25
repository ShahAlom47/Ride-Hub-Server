import { Router } from 'express';
const router = Router();

import updateBikeView, { getBikeData, getBikeDetails } from '../Controller/bikeData.controller';



router.get('/all-bikeData', getBikeData);
router.get('/bike-details/:id', getBikeDetails);
router.patch('/updateBikeView/:id', updateBikeView);

export default router;