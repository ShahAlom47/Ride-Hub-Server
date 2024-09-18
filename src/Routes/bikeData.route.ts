import { Router } from 'express';
const router = Router();

import { getBikeData } from '../Controller/bikeData.controller';



router.get('/all-bikeData', getBikeData);

export default router;