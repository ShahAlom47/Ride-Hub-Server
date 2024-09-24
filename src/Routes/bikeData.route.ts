import { Router } from 'express';
const router = Router();

import { getBikeData, getBikeDetails } from '../Controller/bikeData.controller';



router.get('/all-bikeData', getBikeData);
router.get('/bike-details/:id', getBikeDetails);

export default router;